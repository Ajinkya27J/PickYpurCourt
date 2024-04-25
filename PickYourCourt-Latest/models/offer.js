const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const offerSchema = new Schema({
    itemId: {type: Schema.Types.ObjectId, ref: 'Item'},
    exchangeItemId:  {type: Schema.Types.ObjectId, ref: 'Item'},
    userId: {type: Schema.Types.ObjectId, ref: 'User'}
});
module.exports = mongoose.model('Offer', offerSchema);