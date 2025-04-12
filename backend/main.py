from collections import defaultdict
from flask import Flask, request
from flask_socketio import SocketIO, emit, join_room
from flask_cors import CORS

# from key import get_public_key, decrypt_session_key, encrypt_message, decrypt_message
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Store session keys for connected clients
# session_keys = {}

# @app.route('/')
# def index():
#     return render_template('chat.html')

# @app.route('/get-public-key', methods=['GET'])
# def get_public_key_route():
#     """Send the server's public key to the client."""
#     return jsonify({"public_key": get_public_key().decode()})

# @socketio.on('exchange_key')
# def handle_key_exchange(data):
#     """Receive the encrypted session key from the client."""
#     encrypted_session_key = base64.b64decode(data['encrypted_session_key'])
#     session_key = decrypt_session_key(encrypted_session_key)
#     session_keys[request.sid] = session_key
#     emit('key_exchange_success', {"message": "Session key established!"})


user_handles = defaultdict(dict)  # { room_id: {sid: handle_name}, 'room' }

chat_rooms = defaultdict(dict)


@socketio.on("create")
def handle_create_chat(data):
    """Handle creating a new chat room."""
    handle_name = data["handle"]
    room_name = data["roomName"]
    new_room = str(uuid.uuid4())
    user_handles[new_room][request.sid] = handle_name
    chat_rooms[new_room] = {
        "roomName": room_name,
        "createdAt": datetime.now().isoformat(),
        "memberCount": 0,
        "members": [],
    }
    join_room(new_room)
    emit(
        "chatCreated",
        {
            "success": True,
            "roomId": new_room,
            "roomName": room_name,
            "handle": handle_name,
            "createdAt": chat_rooms[new_room]["createdAt"],
            "joinedAt": chat_rooms[new_room]["createdAt"],
            "memberCount": chat_rooms[new_room]["memberCount"],
            "members": chat_rooms[new_room]["members"],
        },
        room=new_room,
    )


@socketio.on("join")
def handle_join_chat(data):
    """Handle joining an existing chat room."""
    room_id = data["roomId"]
    handle_name = data["handle"]

    if room_id not in chat_rooms:
        emit(
            "chatJoined",
            {
                "success": False,
                "message": "Room does not exist.",
            },
        )
        return

    user_handles[room_id][request.sid] = handle_name
    chat_rooms[room_id]["memberCount"] += 1
    chat_rooms[room_id]["members"].append(handle_name)

    join_room(room_id)
    emit(
        "chatJoined",
        {
            "success": True,
            "roomId": room_id,
            "roomName": chat_rooms[room_id]["roomName"],
            "handle": handle_name,
            "createdAt": chat_rooms[room_id]["createdAt"],
            "joinedAt": datetime.now().isoformat(),
            "memberCount": chat_rooms[room_id]["memberCount"],
            "members": chat_rooms[room_id]["members"],
        },
    )
    emit(
        "receiveMessage",
        {
            "message": f"{handle_name} joined the chat successfully!",
            "sender": "System",
            "roomId": room_id,
        },
        room=room_id,
        include_self=False,
    )


@socketio.on("send")
def handle_send_message(data):
    """Handle incoming encrypted messages."""
    # session_key = session_keys.get(request.sid)
    # if not session_key:
    #     emit('error', {"message": "Session key not established!"})
    #     return
    room = data["roomId"]
    message = data["message"]
    handle_name = user_handles[room][request.sid]
    # encrypted_message = base64.b64decode(data['message'])
    # decrypted_message = decrypt_message(encrypted_message, session_key).decode()

    # print(f"Decrypted message from client in room '{room}': {decrypted_message}")

    # Encrypt the response and send it back to the room
    # response_message = f"Server received: {decrypted_message}"
    # encrypted_response = encrypt_message(response_message, session_key)

    emit(
        "receiveMessage",
        {"message": message, "sender": handle_name, "roomId": room},
        room=room,
        include_self=False,
    )


if __name__ == "__main__":
    socketio.run(app, port=4433)
