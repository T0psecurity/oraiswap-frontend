import useLocalStorage from 'hooks/useLocalStorage';
import React, {
  useState,
  createContext,
  SetStateAction,
  Dispatch,
  useEffect
} from 'react';

export enum Themes {
  light = 'light',
  dark = 'dark'
}

export const ThemeContext = createContext<{
  theme: Themes;
  setTheme: React.Dispatch<React.SetStateAction<Themes>>;
}>({
  theme: Themes.dark,
  setTheme: () => {}
});

export const ThemeProvider = (props: any) => {
  const [currentTheme, setCurrentTheme] = useLocalStorage('theme', Themes.dark);
  const [theme, setTheme] = useState(currentTheme);

  // update to global theme as well as store in localStorage
  useEffect(() => {
    setCurrentTheme(theme);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {props.children}
    </ThemeContext.Provider>
  );
};
