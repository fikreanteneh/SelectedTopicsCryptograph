import React, { createContext, useContext, useState, type ReactNode } from "react";

export type ThemeTypes = "dark" | "light";
// eslint-disable-next-line react-refresh/only-export-components
export const themes: ThemeTypes[] = ["dark", "light"];
export const darkTheme: ThemeTypes = "dark";
export const lightTheme: ThemeTypes = "light";


export type ColorTypes = "green" | "orange" | "purple";
// eslint-disable-next-line react-refresh/only-export-components
export const colors: ColorTypes[] = ["green", "orange", "purple"];
export const green: ColorTypes = "green";
export const orange: ColorTypes = "orange";
export const purple: ColorTypes = "purple";

export type ThemeContextType = {
    currentColor: ColorTypes,
    currentTheme: ThemeTypes,
    changeColor: (payload: ColorTypes) => void,
    changeTheme: (payload: ThemeTypes) => void,
};

const ThemeContext = createContext<ThemeContextType>({
    currentColor: "purple",
    currentTheme: "light",
    changeColor: () => { },
    changeTheme: () => { },
});

const useTheme = () => {
    return useContext<ThemeContextType>(ThemeContext);
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const [currentColor, setCurrentColor] =
        useState<ColorTypes>(window.localStorage.getItem('currentColor') as ColorTypes ?? "purple");
    const [currentTheme, setCurrentTheme] =
        useState<ThemeTypes>(window.localStorage.getItem('currentTheme') as ThemeTypes ?? "light");

    const changeColor = (color: ColorTypes) => {
        setCurrentColor(color);
        window.localStorage.setItem('currentColor', color);
    };

    const changeTheme = (theme: ThemeTypes) => {
        setCurrentTheme(theme);
        window.localStorage.setItem('currentTheme', theme);
    };

    const value = {
        currentColor,
        currentTheme,
        changeColor,
        changeTheme
    };

    const themeClass = currentTheme as string;
    // const colorClass = (currentTheme as string) + (currentColor as string);
    // const colorClass = "light" + "green";
    const colorClass = currentTheme + currentColor;

    return (
        <ThemeContext.Provider value={value}>
            <div className={`${themeClass} ${colorClass} text-main-1`}>
                {children}
            </div>
        </ThemeContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export default useTheme;