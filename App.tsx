import { StatusBar } from 'expo-status-bar';
import { useState, useEffect } from 'react';
import { Button, StyleSheet, Text, TextInput, View, FlatList } from 'react-native';
import { useDrizzleStudio } from 'expo-drizzle-studio-plugin';

import * as SQLite from 'expo-sqlite';

type ListItem = {
  id: number;
  product: string;
  amount: string;
}

const db = SQLite.openDatabaseSync('shoppinglistdb');

export default function App() {

  useDrizzleStudio(db);

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [listItem, setListItems] = useState<ListItem[]>([]);

  const initialize = async () => {
    try {
      await db.execAsync(`
        CREATE TABLE IF NOT EXISTS listitem (id INTEGER PRIMARY KEY NOT NULL, product TEXT, amount TEXT);
        `);
      handleFetch();
    } catch (error) {
      console.error('Could not open database', error);
    }
  }

  const handleSave = async () => {
    try {
      await db.runAsync('INSERT INTO listitem (product, amount) VALUES (?, ?)', product, amount);
      setProduct('');
      setAmount('');
      handleFetch();
    } catch (error) {
      console.error('Could not add item', error);
    }
  }

  const handleFetch = async () => {
    try {
      const list = await db.getAllAsync('SELECT * from listitem');
      setListItems(list as ListItem[]);
    } catch (error) {
      console.error('Could not get items', error);
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await db.runAsync('DELETE FROM listitem WHERE id=?', id);
      await handleFetch();
    }
    catch (error) {
      console.error('Could not delete item', error);
    }
  }

  useEffect(() => { initialize() }, []);

  return (

    <View style={styles.container}>

      <StatusBar style="auto" />

      <Text style={styles.title}>Add items to your shopping list</Text>
      <Text></Text>
      <TextInput
        style={styles.input}
        placeholder='product'
        onChangeText={text => setProduct(text)}
        value={product}
      />
      <TextInput
        style={styles.input}
        placeholder='amount'
        onChangeText={text => setAmount(text)}
        value={amount}
      />

      <View style={styles.buttons}>
        <Button title="SAVE" onPress={handleSave} />
      </View>

      <FlatList
        data={listItem}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <Text style={styles.listTitle}>Shopping List</Text>
        }
        renderItem={({ item }) => (
          <View style={{ flexDirection: 'row' }}>
            <Text style={styles.listItem}>{item.product}, </Text>
            <Text style={styles.listItem}>{item.amount} </Text>
            <Text style={styles.listItemBought} onPress={() => handleDelete(item.id)}>bought</Text>
          </View>
        )}
      />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 140,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    width: 250,
    height: 40
  },
  buttons: {
    flexDirection: 'row',
    gap: 20,
    marginTop: 20,
  },
  listTitle: {
    marginTop: 30,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  listItem: {
    fontSize: 16,
    textAlign: 'center',
  },
  listItemBought: {
    fontSize: 16,
    textAlign: 'center',
    color: 'blue',
  },
});