import { ThemeContext } from 'context/theme-context';
import { useContext } from 'react';

export default function useTheme() {
  const { theme } = useContext(ThemeContext);
  return theme;
}
