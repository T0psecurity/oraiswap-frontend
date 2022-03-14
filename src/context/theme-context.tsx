import React, { useState, createContext, SetStateAction, Dispatch } from "react";

export enum Themes {
  light = 'light',
  dark = 'dark'
}

export const ThemeContext = createContext<{
    theme: Themes;
    setTheme: React.Dispatch<React.SetStateAction<Themes>>; 
  }>
  ({
    theme: Themes.dark,
    setTheme: () => {}
  });

export const ThemeProvider = (props: any) => {
  const [theme, setTheme] = useState(Themes.dark);

  return (
    <ThemeContext.Provider value={{theme, setTheme}}>
      {props.children}
    </ThemeContext.Provider>
  );
};