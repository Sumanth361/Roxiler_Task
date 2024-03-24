import express from "express";
import mongoose from "mongoose";
import axios from "axios";

const transactionSchema = new mongoose.Schema({
    id: String,
    title:String,
    price: Number,
    description:String,
    category:String,
    image:String,
    sold:Boolean,
    dateOfSale:String
  });

const Transaction = mongoose.model('Transaction', transactionSchema);

const routes = express.Router();

// Initialize database with seed data from third-party API
routes.get('/initialize-database', async (req, res) => {
  try {
    // Fetch data from third-party API
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const data = response.data;

    // Insert data into database
    await Transaction.insertMany(data);

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'An error occurred while initializing the database' });
  }
});



routes.get('/transactions/:month', async (req, res) => {
    try {
      const month = req.params.month.toLowerCase(); // Extract month parameter from the URL and convert to lowercase
      const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
      //console.log(month);
      if (!monthNames.includes(month)) {
        return res.status(400).json({ error: "Invalid month input from user." });
      }
  
      const transactions = await Transaction.find().maxTimeMS(30000);;
      //console.log(transactions)
      const filteredTransactions = transactions.filter(transaction => {
        const date = new Date(transaction.dateOfSale);
        //console.log(date)
        const monthN = date.getMonth()+1;
        //console.log(monthN);
        const monthName = monthNames[monthN - 1]; 
        //console.log(monthName)
        //const transactionMonth = monthName.toLocaleString('default', { monthName: 'long' }).toLowerCase();
        return monthName === month;
      });
  
      res.json({ transactions: filteredTransactions });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
});

    
  
   
    
    
    // Retrieve query parameters
    // const month = req.params.month;
    // const search = req.query.search;
    // const page = parseInt(req.query.page) || 1;
    // const perPage = parseInt(req.query.perPage) || 10;
  
    // // Filter transactions by month
    // let filteredTransactions = transactions.filter(transaction => {
    //   const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1; // Adding 1 because getMonth() returns 0-indexed month
    //   return transactionMonth === parseInt(month);
    // });
  
    // // If search parameter is provided, further filter transactions
    // if (search) {
    //   const searchRegex = new RegExp(search, 'i'); // Case-insensitive search
    //   filteredTransactions = filteredTransactions.filter(transaction => {
    //     return (
    //       transaction.title.match(searchRegex) ||
    //       transaction.description.match(searchRegex) ||
    //       transaction.price.toString().match(searchRegex)
    //     );
    //   });
    // }
  
    // // Implement pagination
    // const startIndex = (page - 1) * perPage;
    // const endIndex = startIndex + perPage;
    // const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);
  
    // // Return paginated transactions as JSON response
    // res.json({
    //   totalTransactions: filteredTransactions.length,
    //   transactions: paginatedTransactions
    // });


routes.get('/statistics/:month',async(req,res)=>{
  try {
    const month = req.params.month.toLowerCase(); // Extract month parameter from the URL and convert to lowercase
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    //console.log(month);
    if (!monthNames.includes(month)) {
      return res.status(400).json({ error: "Invalid month input from user." });
    }

    const transactions = await Transaction.find().maxTimeMS(30000);;
    //console.log(transactions)
    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.dateOfSale);
      //console.log(date)
      const monthN = date.getMonth()+1;
      //console.log(monthN);
      const monthName = monthNames[monthN - 1]; 
      //console.log(monthName)
      //const transactionMonth = monthName.toLocaleString('default', { monthName: 'long' }).toLowerCase();
      return monthName === month;
    });

    let totalSaleAmount = 0;
    filteredTransactions.forEach(transaction => {
      if(transaction.sold === true)
      {
        totalSaleAmount += transaction.price;
      }
    });

    let totalSale = 0;
    filteredTransactions.forEach(transaction => {
      if(transaction.sold===true)
      {
        totalSale += 1;
      }
    });

    let notSale = 0;
    filteredTransactions.forEach(transaction => {
      if(transaction.sold===false)
      {
        notSale += 1;
      }
    });
    
    res.json({ transactions: totalSaleAmount.toFixed(2), totalSale: totalSale.toFixed(2),notSale:notSale });
    
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
})


routes.get('/bar-chart/:month', async (req, res) => {
  try {
    const month = req.params.month.toLowerCase();
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    if (!monthNames.includes(month)) {
      return res.status(400).json({ error: "Invalid month input from user." });
    }

    const transactions = await Transaction.find();
    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.dateOfSale);
      const transactionMonth = date.getMonth() + 1;
      const monthName = monthNames[transactionMonth - 1]; 
      return monthName === month;
    });

    const priceRanges = [
      { range: "0 - 100", count: 0 },
      { range: "101 - 200", count: 0 },
      { range: "201 - 300", count: 0 },
      { range: "301 - 400", count: 0 },
      { range: "401 - 500", count: 0 },
      { range: "501 - 600", count: 0 },
      { range: "601 - 700", count: 0 },
      { range: "701 - 800", count: 0 },
      { range: "801 - 900", count: 0 },
      { range: "901 - above", count: 0 }
    ];

    filteredTransactions.forEach(transaction => {
      const price = transaction.price;
      if (price >= 0 && price <= 100) {
        priceRanges[0].count++;
      } else if (price >= 101 && price <= 200) {
        priceRanges[1].count++;
      } else if (price >= 201 && price <= 300) {
        priceRanges[2].count++;
      } else if (price >= 301 && price <= 400) {
        priceRanges[3].count++;
      } else if (price >= 401 && price <= 500) {
        priceRanges[4].count++;
      } else if (price >= 501 && price <= 600) {
        priceRanges[5].count++;
      } else if (price >= 601 && price <= 700) {
        priceRanges[6].count++;
      } else if (price >= 701 && price <= 800) {
        priceRanges[7].count++;
      } else if (price >= 801 && price <= 900) {
        priceRanges[8].count++;
      } else if (price >= 901) {
        priceRanges[9].count++;
      }
    });

    res.json({ priceRanges });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


routes.get('/pie-chart/:month', async (req, res) => {
  try {
    const month = req.params.month.toLowerCase();
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

    if (!monthNames.includes(month)) {
      return res.status(400).json({ error: "Invalid month input from user." });
    }

    const transactions = await Transaction.find();
    const filteredTransactions = transactions.filter(transaction => {
      const date = new Date(transaction.dateOfSale);
      const transactionMonth = date.getMonth() + 1;
      const monthName = monthNames[transactionMonth - 1]; 
      return monthName === month;
    });

    const categoriesMap = new Map();
    filteredTransactions.forEach(transaction => {
      const category = transaction.category;
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, 1);
      } else {
        categoriesMap.set(category, categoriesMap.get(category) + 1);
      }
    });

    const categories = [];
    categoriesMap.forEach((value, key) => {
      categories.push({ category: key, count: value });
    });

    res.json({ categories });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});


routes.get('/combined-data/:month', async (req, res) => {
  try {
    const month = req.params.month.toLowerCase();
    const promises = [];

    // API endpoints
    const urls = [
      `/statistics/${month}`,
      `/bar-chart/${month}`,
      `/pie-chart/${month}`
    ];

    // Execute multiple asynchronous operations concurrently
    urls.forEach(url => {
      promises.push(axios.get(`http://localhost:3000${url}`));
    });

    // Wait for all promises to resolve
    const responses = await Promise.all(promises);

    // Extract data from responses
    const combinedData = {
      statistics: responses[0].data,
      barChart: responses[1].data,
      pieChart: responses[2].data
    };

    res.json(combinedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});



export {routes as adminRouter}