import React from 'react';
import routes from 'routes';
import { ThemeProvider } from 'styled-components';
import variables from 'styles/_variables.scss';

const App = () => {
  console.log('App');
  return <ThemeProvider theme={variables}>{routes()}</ThemeProvider>;
};

export default App;
