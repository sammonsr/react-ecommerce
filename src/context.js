// Working with the context API so don't have to pass data all the way down
import React, { Component } from "react";
// storeProducts is the name of the array
import { storeProducts, detailProduct } from "./data";

// Comes with two components: provider & consumer
const ProductContext = React.createContext();
// Provider
// Consumer

// Going to return product context and provider component
// Needs to sit on top of the applicaion (place as high as possible - in index.js, wrap router & app)
class ProductProvider extends Component {
  state = {
    // can't set products directly to storeProducts, as is a reference & would override vals
    products: [],
    detailProduct: detailProduct,
    cart: [],
    modalOpen: false,
    modalProduct: detailProduct,
    cartSubTotal: 0,
    cartTax: 0,
    cartTotal: 0,
  };
  componentDidMount() {
    this.setProducts();
  }
  // Create methods
  setProducts = () => {
    let products = [];
    storeProducts.forEach((item) => {
      // this copies values instead of referencing them
      const singleItem = { ...item };
      // adding singleItem to current products array
      products = [...products, singleItem];
    });
    this.setState(() => {
      // products:products which means products = products
      return { products };
    });
  };

  getItem = (id) => {
    // look for item with given id
    const product = this.state.products.find((item) => item.id === id);
    return product;
  };

  // called when click on product image
  handleDetail = (id) => {
    const product = this.getItem(id);
    this.setState(() => {
      return { detailProduct: product };
    });
  };

  addToCart = (id) => {
    // create temp array to ensure don't mutate the state
    let tempProducts = [...this.state.products];
    const index = tempProducts.indexOf(this.getItem(id));
    const product = tempProducts[index];
    product.inCart = true;
    product.count = 1;
    const price = product.price;
    product.total = price;

    // change values in the actual state
    this.setState(
      () => {
        return { products: tempProducts, cart: [...this.state.cart, product] };
      },
      // callback function
      () => {
        this.addTotals();
      }
    );
  };

  // Pop up when add item to cart
  openModal = (id) => {
    const product = this.getItem(id);
    this.setState(() => {
      return { modalProduct: product, modalOpen: true };
    });
  };

  closeModal = () => {
    this.setState(() => {
      return { modalOpen: false };
    });
  };

  // Working with items in cart
  increment = (id) => {
    let tempCart = [...this.state.cart];
    const selectedProduct = tempCart.find((item) => item.id === id);

    const index = tempCart.indexOf(selectedProduct);
    const product = tempCart[index];

    product.count = product.count + 1;
    product.total = product.count * product.price;

    this.setState(
      () => {
        return {
          cart: [...tempCart],
        };
      },
      // important to run as callback function so know totals are counted exactly when cart is changed
      () => {
        this.addTotals();
      }
    );
  };
  decrement = (id) => {
    let tempCart = [...this.state.cart];
    const selectedProduct = tempCart.find((item) => item.id === id);

    const index = tempCart.indexOf(selectedProduct);
    const product = tempCart[index];

    if (product.count === 1) {
      this.removeItem(id);
    } else {
      product.count = product.count - 1;
      product.total = product.count * product.price;

      this.setState(
        () => {
          return {
            cart: [...tempCart],
          };
        },
        // important to run as callback function so know totals are counted exactly when cart is changed
        () => {
          this.addTotals();
        }
      );
    }
  };

  removeItem = (id) => {
    let tempProducts = [...this.state.products];
    let tempCart = [...this.state.cart];

    tempCart = tempCart.filter((item) => item.id !== id);
    const index = tempProducts.indexOf(this.getItem(id));
    let removedProduct = tempProducts[index];

    // update info for item being removed
    removedProduct.inCart = false;
    removedProduct.count = 0;
    removedProduct.total = 0;

    this.setState(
      () => {
        return {
          cart: [...tempCart],
          products: [...tempProducts],
        };
      },
      () => {
        this.addTotals();
      }
    );
  };
  clearCart = () => {
    this.setState(
      () => {
        return { cart: [] };
      },
      () => {
        this.setProducts();
        // update totals
        this.addTotals();
      }
    );
  };
  addTotals = () => {
    let subtotal = 0;
    this.state.cart.map((item) => (subtotal += item.total));
    // saying tax is 10% (0.1)
    const tempTax = subtotal * 0.1;
    // get value to 2 decimals
    const tax = parseFloat(tempTax.toFixed(2));
    const total = subtotal + tax;
    this.setState(() => {
      return {
        cartSubTotal: subtotal,
        cartTax: tax,
        cartTotal: total,
      };
    });
  };

  render() {
    return (
      <ProductContext.Provider
        value={{
          //  products: this.state.products
          // destructuring: get all the properties in the state
          ...this.state,
          handleDetail: this.handleDetail,
          addToCart: this.addToCart,
          openModal: this.openModal,
          closeModal: this.closeModal,
          increment: this.increment,
          decrement: this.decrement,
          removeItem: this.removeItem,
          clearCart: this.clearCart,
        }}
      >
        {/* return all the children that will be in our application */}
        {this.props.children}
      </ProductContext.Provider>
    );
  }
}

// Create a consumer
const ProductConsumer = ProductContext.Consumer;

export { ProductProvider, ProductConsumer };
