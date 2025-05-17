import base64
from collections import defaultdict
from functools import wraps
from flask import Flask, request, jsonify
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

import uuid
from datetime import datetime

from security import (
    decrypt_json,
    decrypt_session_key,
    encrypt_json,
    get_public_key,
)

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")


session_keys = {}  # Store session keys for connected clients
user_handles = defaultdict(dict)  # { room_id: {sid: handle_name}, 'room' }
chat_rooms = defaultdict(dict)


def decrypt_middleware(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        session_key = session_keys.get(request.sid)
        if not session_key:
            emit("error", {"message": "Session key not established!"})
            return

        # Decrypt the incoming data
        try:
            decrypted_data = decrypt_json(args[0], session_key)
            # Pass the decrypted data to the wrapped function
            return func(decrypted_data, *args[1:], **kwargs)
        except Exception as e:
            emit("error", {"message": "Failed to decrypt data!", "error": str(e)})
            return

    return wrapper


@app.route("/getPublicKey", methods=["GET"])
def get_public_key_route():
    """Send the server's public key to the client."""
    public_key = get_public_key()
    public_key_str = public_key.decode("utf-8")
    return jsonify({"publicKey": public_key_str})


@socketio.on("exchangeKey")
def handle_key_exchange(data):
    """Receive the encrypted session key from the client."""
    session_key = decrypt_session_key(data)
    session_keys[request.sid] = session_key
    encrypted_message = encrypt_json(
        {"success": True, "message": "Session key established!"},
        session_key,
    )
    emit("exchangeKeySuccess", encrypted_message, to=request.sid)


@socketio.on("create")
@decrypt_middleware
def handle_create_chat(data):
    """Handle creating a new chat room."""
    handle_name = data["handle"]
    room_name = data["roomName"]
    new_room = str(uuid.uuid4())
    user_handles[new_room][request.sid] = handle_name
    created_at = datetime.now().isoformat()
    chat_rooms[new_room] = {
        "roomName": room_name,
        "createdAt": created_at,
        "memberCount": 1,
        "members": [
            {"handle": handle_name, "sid": request.sid, "joinedAt": created_at}
        ],
    }

    join_room(new_room)

    encrypted_message = encrypt_json(
        {
            "roomId": new_room,
            "roomName": room_name,
            "handle": handle_name,
            "createdAt": chat_rooms[new_room]["createdAt"],
            "memberCount": chat_rooms[new_room]["memberCount"],
            "members": chat_rooms[new_room]["members"],
        },
        session_keys[request.sid],
    )
    emit("chatCreated", encrypted_message, to=request.sid)


@socketio.on("join")
@decrypt_middleware
def handle_join_chat(data):
    """Handle joining an existing chat room."""
    room_id = data["roomId"]
    handle_name = data["handle"]

    if room_id not in chat_rooms:
        encrypted_message = encrypt_json(
            {"message": "Room does not exist."},
            session_keys[request.sid],
        )
        emit("error", encrypted_message)
        return

    user_handles[room_id][request.sid] = handle_name
    chat_rooms[room_id]["memberCount"] += 1
    chat_rooms[room_id]["members"].append(
        {
            "handle": handle_name,
            "sid": request.sid,
            "joinedAt": datetime.now().isoformat(),
        }
    )

    join_room(room_id)
    join_detail = {
        "roomId": room_id,
        "roomName": chat_rooms[room_id]["roomName"],
        "handle": handle_name,
        "createdAt": chat_rooms[room_id]["createdAt"],
        "memberCount": chat_rooms[room_id]["memberCount"],
        "members": chat_rooms[room_id]["members"],
    }

    emit(
        "chatJoined",
        encrypt_json(join_detail, session_keys[request.sid]),
        to=request.sid,
    )

    for user in chat_rooms[room_id]["members"]:
        sid = user["sid"]
        if sid == request.sid:
            continue
        encrypted_message = encrypt_json(join_detail, session_keys[sid])
        emit("someoneJoined", encrypted_message, to=sid)


@socketio.on("send")
@decrypt_middleware
def handle_send_message(data):
    """Handle incoming encrypted messages."""
    room = data["roomId"]
    message = data["message"]
    handle_name = user_handles[room][request.sid]

    json_message = {
        "message": message,
        "sender": handle_name,
        "roomId": room,
        "createdAt": datetime.now().isoformat(),
    }

    # TODO: Create session key for the group instead of the user
    for user in chat_rooms[room]["members"]:
        sid = user["sid"]
        encrypted_message = encrypt_json(
            json_message,
            session_keys[sid],
        )
        emit("receiveMessage", encrypted_message, to=user["sid"])


if __name__ == "__main__":
    socketio.run(app, port=4433)

# Generate a self-signed certificate for testing purposes
# openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365 -nodes
