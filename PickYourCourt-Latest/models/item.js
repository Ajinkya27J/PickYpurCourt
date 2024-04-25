const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = new Schema({
    name: {type: String, required: [true, 'Name is required']},
    category: {type: String, required: [true, 'Category is required']},
    condition: {type: String, required: [true, 'Condition is required']},
    model: {type: String, required: [true, 'Model is required'],  minLength: [2, 'The model must have atleast 2 characters'],  maxLength: [10, 'The model cannot exceed 10 characters']},
    manufacturer: {type: String, required: [true, 'Manufacturer is required']},
    details: {type: String, required: [true, 'Details is required'], minLength: [10, 'The Details must have atleast 10 characters']},
    status: {type: String, required: [true, 'Status is required'], enum: { values: ['Available', 'Offer Pending', 'Traded'], message: '{VALUE} is not supported as Status. The accepted values are Available, Offer Pending, Traded' }},
    image: {type: String, required: [true, 'Image is required']},
    createdBy: {type: Schema.Types.ObjectId, ref: 'User'},
    watchedBy: {type: Array, default: []},
    offerId: {type: Schema.Types.ObjectId, ref: 'Offer'}

},
{timestamps: true } /*createdAt & InsertedAt times*/
);
//collection name is items in the database
module.exports = mongoose.model('Item', itemSchema);