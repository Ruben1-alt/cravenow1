const mongoose = require("mongoose");

const MenuItemSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String 
  },
  price: { 
    type: Number, 
    required: true 
  },
  image: { 
    type: String 
  },
  category: {
    type: String,
    enum: ["Appetizer", "Main Course", "Dessert", "Beverage", "Side Dish"],
    required: true
  },
  availability: { 
    type: Boolean, 
    default: true 
  },
  discount: {
    percentage: { 
      type: Number, 
      default: 0 
    },  
    validUntil: { 
      type: Date 
    } 
  },
  stock: { 
    type: Number, 
    default: 100
  },
  // New fields for customization
  sizes: [{
    size: { 
      type: String, 
      enum: ["Small", "Medium", "Large"], 
      required: true 
    },
    priceAdjustment: {
      type: Number, // Optional price change based on size
      default: 0 
    }
  }],
  addons: [{
    name: { 
      type: String, 
      required: true 
    },
    price: { 
      type: Number, 
      required: true 
    }
  }],
  dietaryRestrictions: [{
    restriction: { 
      type: String, 
      enum: ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "Nut-Free", "Halal", "Kosher"],
      required: true
    }
  }]
});

const MenuItem = mongoose.model("MenuItem", MenuItemSchema);
module.exports = MenuItem;
