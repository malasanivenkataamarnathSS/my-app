// Mobile App Foundation - Example structure

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Provider } from 'react-redux';
import { store } from './src/store';

// Screens
import { LoginScreen } from './src/screens/Auth/LoginScreen';
import { HomeScreen } from './src/screens/Home/HomeScreen';
import { ProductListScreen } from './src/screens/Products/ProductListScreen';
import { CartScreen } from './src/screens/Cart/CartScreen';
import { ProfileScreen } from './src/screens/Profile/ProfileScreen';

const Stack = createStackNavigator();

const App = () => {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen 
            name="Login" 
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen 
            name="Home" 
            component={HomeScreen}
            options={{ title: 'MyApp' }}
          />
          <Stack.Screen 
            name="Products" 
            component={ProductListScreen}
            options={{ title: 'Products' }}
          />
          <Stack.Screen 
            name="Cart" 
            component={CartScreen}
            options={{ title: 'Shopping Cart' }}
          />
          <Stack.Screen 
            name="Profile" 
            component={ProfileScreen}
            options={{ title: 'Profile' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
};

export default App;