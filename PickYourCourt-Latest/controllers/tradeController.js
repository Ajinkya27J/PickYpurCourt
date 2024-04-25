const model = require('../models/item');
const Offer = require('../models/offer');
const User = require('../models/user');

exports.index = (req, res, next)=> {
    Promise.all([model.find(), model.distinct('category')])
    .then((results) => {
        const [items, categories] = results;
        res.render('./trade/index', {categories, items});
    })
    .catch(err => next(err));
}

exports.new = (req, res ) => {
    res.render('./trade/new');
};

exports.create = (req, res, next) => { 
    let item = new model(req.body);
    item.createdBy = req.session.user;
    item.save()
    .then(item => {
        req.flash('success', 'Trade item has been created successfully!');
        res.redirect('/trades');
    })
    .catch(err => {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    });
};

exports.show = (req, res, next)=> {
    let id = req.params.id;
    model.findById(id).populate('createdBy', 'firstName lastName')
    .then(item => {
        if (item) {
            res.render('./trade/show', {item});
        } else {
            let err = new Error('Cannot find item with id '+ id)
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
};

exports.edit = (req, res, next) => {
    let id = req.params.id;
    model.findById(id)
    .then(item => {
        if (item) {
            res.render('./trade/edit', {item});
        } else {
            let err = new Error('Cannot find item with id '+ id)
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}

exports.update = (req, res, next) =>{
    let item = req.body;
    let id = req.params.id;
    model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
    .then(item => {
        if(item) {
            req.flash('success', 'Trade item has been updated successfully!');
            res.redirect('/trades/' + id);
        } else {
            let err = new Error('Cannot find an item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => {
        if(err.name === 'ValidationError' ) {
            req.flash('error', err.message);
            return res.redirect('back');
        }
        next(err);
    })
};

exports.delete = (req, res, next) => {
    let id = req.params.id;
    model.findByIdAndDelete(id, {useFindAndModify: false, runValidators: true})
    .then(item => {
        if(item) {
            req.flash('success', 'Trade item has been deleted successfully!');
            res.redirect('/trades');
        } else {
            let err = new Error('Cannot find an item with id ' + id);
            err.status = 404;
            next(err);
        }
    })
    .catch(err => next(err))
}

exports.watch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(item => {
        if(!item.watchedBy.includes(req.session.user)) {
            item.watchedBy.push(req.session.user);
        }
        model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
        .then(watchedItem => {
            return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};

exports.unwatch = (req, res, next) => {  
    const id = req.params.id;
    model.findById(id)
    .then(item => {
        const watchIndex = item.watchedBy.indexOf(req.session.user);
        if(watchIndex !== -1) {
            item.watchedBy.splice(watchIndex, 1);
        }
        model.findByIdAndUpdate(id, item, {useFindAndModify: false, runValidators: true})
        .then(watchedItem => {
            return res.redirect('back');
        })
        .catch(err => next(err))
    })
    .catch(err => next(err))
};
exports.trade = (req, res, next) => { 
    let exchangeItem = {id: req.params.id };
    let id = req.session.user;
    Promise.all([User.findById(id) , model.find({createdBy: id, status: "Available" })])
    .then(results => {
        [user, items] = results;
        res.render('./user/userItems', {user, items, exchangeItem });  
        
    })
    .catch(err=>next(err));
};

exports.offer = (req, res, next) => { 
    let offer = new Offer(req.body);
    offer.exchangeItemId = req.params.id;
    offer.userId = req.session.user;
    offer.save()
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offer.itemId, offer.exchangeItemId]}
        }, {status: "Offer Pending", "offerId": offerItem.id})
        .then(result => {
            req.flash('success', 'Trade Offer has been created successfully!');
            return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};

exports.manageOffer = (req, res, next) => { 
    const userId = req.session.user;
    Offer.findById(req.params.id)
    .then(offerItem => {
        if(offerItem) {
            model.find({"_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}})
            .then(result => {
                if (result && result.length === 2) {
                    const user = { isOfferInitiator: offerItem.userId == userId ? true: false};
                    let item1, item2 = null;
                    if(result[0].createdBy == userId) {
                        item1 = result[0];
                        item2 = result[1];
                    } else {
                        item1 = result[1];
                        item2 = result[0];
                    }
                    res.render('./offer/manage', {user, item1, item2, offerItem});
                } else {
                    let err = new Error('Cannot find item with id '+ id)
                    err.status = 404;
                    next(err);
                }
        
            })
        } else {
            let err = new Error('Cannot find the offer associated with this Item')
            err.status = 404;
            next(err);
        } 
    })      
    .catch(err => next(err))
};
exports.acceptOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Traded"})
        .then(result => {
           return res.redirect('/users/profile');
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};
exports.cancelOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerItem.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err => next(err));
        })
        })
        .catch(err => next(err))
};

exports.rejectOffer = (req, res, next) => { 
    Offer.findById(req.params.id)
    .then(offerItem => {
        model.updateMany({
            "_id": {$in: [offerItem.itemId, offerItem.exchangeItemId]}
        }, {status: "Available", offerId: null})
        .then(result => {
            Offer.findByIdAndDelete(offerItem.id, {useFindAndModify: false, runValidators: true})
            .then(result => {
                return res.redirect('/users/profile');
            })
            .catch(err => next(err));
        })
        .catch(err => next(err))
    })
    .catch(err => {
        next(err);
    });
};