/**
 * @format
 */
import React from 'react'
import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import {Provider} from 'react-redux'
import configureStore from './src/redux/store/configureStore'
const store = configureStore();

const rnRedux = ()=>(
<Provider store = {store}>
 <App/>
 {/* <Text>asi</Text> */}
  </Provider>
)

// AppRegistry.registerComponent('KlendiGram', () =>rnRedux);
AppRegistry.registerComponent(appName, () => rnRedux);
