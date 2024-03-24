import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';

import { Chart, LinearScale,CategoryScale  } from 'chart.js';
Chart.register(LinearScale);
Chart.register(CategoryScale);



const TransactionsTable = () => {

    

const[transactions,setTransactions]=useState([]);
const[transStatistics,setTransStatistics]=useState({});
const[chartData, setChartData] = useState([]);
const[error, setError] = useState(null);
const[selectedMonth, setSelectedMonth] = useState('March');

useEffect(() => {
    fetchTransactions(selectedMonth);
    fetchStatistics(selectedMonth);
    fetchBarGraph(selectedMonth);
}, [selectedMonth]);


const renderChart = () => {
    if (chartData) {
      const labels = chartData.map(range => range.range);
      const counts = chartData.map(range => range.count);

      const data = {
        labels: labels,
        datasets: [
          {
            label: 'Number of Items',
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1,
            hoverBackgroundColor: 'rgba(54, 162, 235, 0.7)',
            hoverBorderColor: 'rgba(54, 162, 235, 1)',
            data: counts
          }
        ]
      };

      const options = {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      };

      return <Bar data={data} options={options} />;
    } else if (error) {
      return <div>Error: {error}</div>;
    } else {
      return <div>Loading...</div>;
    }
  };




  const handleMonthChange = (event) => {
setSelectedMonth(event.target.value);

  };

  const fetchTransactions = async (month) => {
    try {
      const response = await axios.get(`http://localhost:3000/transactions/${month}`);
      //console.log(response);
      setTransactions(response.data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };


  const fetchStatistics=async(month)=>{
    try{
        const response=await axios.get(`http://localhost:3000/statistics/${month}`);
        //console.log(response);
        setTransStatistics(response.data);
    }catch(error){
        console.error('Error fetching transactions:',error);
    }
  }

  const fetchBarGraph=async(month)=>{
    try{
        const response = await axios.get(`http://localhost:3000/bar-chart/${month}`);
        console.log(response)
        setChartData(response.data.priceRanges);
      } catch (error) {
        setError('Error fetching chart data');
        console.error('Error fetching chart data:', error);
      }
    }


  return (
    <div>
      <h2>Transactions Table</h2>
      <label htmlFor="month">Select Month:</label>
      <select id="month" value={selectedMonth} onChange={handleMonthChange}>
        {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map((month) => (
          <option key={month} value={month}>{month}</option>
        ))}
      </select>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Price</th>
            <th>Description</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
            {/* Add additional table headers as needed */}
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.title}</td>
              <td>{transaction.price}</td>
              <td>{transaction.description}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold}</td>
              <td>{transaction.image}</td>
              {/* Render additional transaction data as needed */}
            </tr>
          ))}
        </tbody>
      </table>
    
    <div>
      <h2>Statistics {selectedMonth}</h2>
      <h3>Total Sale : {transStatistics.transactions}</h3>
      <h3>Total Sold Item : {transStatistics.totalSale}</h3>
      <h3>Total Not Sold Item : {transStatistics.notSale}</h3>
    </div>

    <div>
      <h2>Bar Chart</h2>
      {renderChart()}
    </div>
      
    </div>
  );
};

export default TransactionsTable;
