import React, { useEffect, useState } from 'react';
import { db } from '../config/firebase'; // Make sure to import your Firebase configuration
import { collection, getDocs } from 'firebase/firestore';

function Admin() {
  const [foundItems, setFoundItems] = useState([]);

  // Fetch data from Firestore when the component loads
  useEffect(() => {
    const fetchFoundItems = async () => {
      try {
        // Reference to the "FoundItems" collection
        const foundItemsCollectionRef = collection(db, 'FoundItems');
        // Fetch all documents in the "FoundItems" collection
        const snapshot = await getDocs(foundItemsCollectionRef);
        const itemsList = snapshot.docs.map(doc => ({
          id: doc.id, // Get document ID
          ...doc.data(), // Spread the document data
        }));
        setFoundItems(itemsList); // Set the state with the fetched data
      } catch (error) {
        console.error("Error fetching found items: ", error);
      }
    };

    fetchFoundItems(); // Call the function
  }, []);

  return (
    <div>
      <h1>Found Items</h1>
      <ul>
        {foundItems.map(item => (
          <li key={item.id}>
            <strong>Name:</strong> {item.Name} <br />
            <strong>Brand:</strong> {item.Brand} <br />
            <strong>Location Found:</strong> {item["Location Found"]} <br />
            <strong>Date Found:</strong> {new Date(item["Date Found"]).toLocaleString()} <br />
            <strong>Reported By:</strong> {item["Reported By"]} <br />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Admin;
