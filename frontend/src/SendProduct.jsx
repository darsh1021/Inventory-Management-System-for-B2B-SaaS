import axios from "axios";

function SendProduct() {
  const handleClick = async () => {
    try {
      const response = await axios.post(
        "http://localhost:3000/api/products",
        {
            name: "Mobile",
            sku: "1.12",
            price: 999,
            warehouse_id: 21,
            initial_quantity:22
        }
      );
      console.log(response.data);
      alert("Request successful!");
    } catch (err) {
      console.error(err);
      alert("Request failed!");
    }
  };

  return <button onClick={handleClick}>Send Product Request</button>;
}

export default SendProduct;
