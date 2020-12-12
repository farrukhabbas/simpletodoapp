/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useEffect, useRef, useState} from 'react';
import {
  View,
  Text,
  Alert,
  Button,
  FlatList,
  TextInput,
  StatusBar,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import {ListItem, Icon} from 'react-native-elements';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Saving data to Async storage
const storeData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (e) {
    Alert.alert('Failed to save data.');
  }
};

// Retrieving data from async storage
const getData = async (key) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    Alert.alert('Failed to load data');
  }
};

const App: () => React$Node = () => {
  // for removing focus from the input
  const input = useRef();
  // list of todos objects
  const [todos, setTodos] = useState([]);
  // list of todos that have been completed
  const [comp, setComp] = useState([]);
  // for input text value
  const [value, setValue] = useState('');

  // load data for the first time the app loads
  useEffect(() => {
    getData('@gsquad_todos').then(setTodos);
    getData('@gsquad_comp').then(setComp);
  }, []);

  // save data every time any of the two lists change
  useEffect(() => {
    storeData('@gsquad_todos', todos).then(() => {
      console.log('data saveds');
    });
    storeData('@gsquad_comp', comp).then(() => {
      console.log('data saveds');
    });
  }, [todos, comp]);

  // add the latest text input to the list
  const addTodo = () => {
    if (value !== '') {
      todos.push({value: value, isDone: false});
      // https://github.com/facebook/react-native/issues/24410
      setTodos([...todos]);
      setValue('');
      if (input) {
        input.current.blur();
      }
    }
  };

  // mark the clicked item done, and move it to completed list
  const todoDone = (index, check, list) => {
    if (index < 0) {
      return;
    }

    let todo = null;

    if (list === 'todo' && index < todos.length) {
      todo = todos.splice(index, 1)[0];
      todo.isDone = check;
      comp.push(todo);
    } else if (list === 'comp' && index < comp.length) {
      todo = comp.splice(index, 1)[0];
      todo.isDone = check;
      todos.push(todo);
    }

    setTodos([...todos]);
    setComp([...comp]);
  };

  const removeItem = (index, list) => {
    if (index < 0) {
      return;
    }

    if (list === 'todo' && index < todos.length) {
      todos.splice(index, 1);
      setTodos([...todos]);
    } else if (list === 'comp' && index < comp.length) {
      comp.splice(index, 1);
      setComp([...comp]);
    }
  };

  const renderItem = (index, item, list) => {
    return (
      <ListItem bottomDivider>
        <ListItem.Content>
          <ListItem.CheckBox
            onPress={() => {
              todoDone(index, !item.isDone, list);
            }}
            title={item.value}
            checked={item.isDone}
          />
        </ListItem.Content>
        <Icon
          name="trash"
          type="font-awesome"
          color="gray"
          onPress={() => removeItem(index, list)}
        />
      </ListItem>
    );
  };

  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <View style={styles.header}>
          <Text style={styles.h1}>gsquad Todo App</Text>
        </View>
        <View style={styles.body}>
          <View style={[styles.sectionContainer, styles.float]}>
            <TextInput
              editable
              ref={input}
              value={value}
              style={styles.input}
              onChangeText={setValue}
              placeholder="Enter New Todo"
            />
            <Button style={styles.button} title="Add" onPress={addTodo} />
          </View>

          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Todo list</Text>
            <FlatList
              data={todos}
              renderItem={({index, item}) => renderItem(index, item, 'todo')}
              keyExtractor={(item, index) => '' + index}
            />
          </View>

          {comp.length > 0 && (
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Completed</Text>
              <FlatList
                data={comp}
                renderItem={({index, item}) => renderItem(index, item, 'comp')}
                keyExtractor={(item, index) => 'c' + index}
              />
            </View>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: 'white',
  },
  header: {
    backgroundColor: 'blue',
    padding: 40,
  },
  h1: {
    fontSize: 30,
    fontWeight: '600',
    color: 'white',
  },
  body: {
    backgroundColor: 'white',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: 'black',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
    color: 'black',
  },
  highlight: {
    fontWeight: '700',
  },
  footer: {
    color: 'black',
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  input: {
    flex: 1,
    borderRadius: 5,
    backgroundColor: '#fcfafa',
    paddingLeft: 15,
    height: 40,
  },
  float: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  button: {
    height: 42,
    width: 42,
    padding: 10,
  },
});

export default App;
