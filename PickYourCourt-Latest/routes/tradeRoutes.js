const express = require('express');
const controller = require('../controllers/tradeController');
const {isLoggedIn, isCreator, isNotCreator, isOfferCreator, isNotOfferCreator} = require('../middlewares/auth');
const {validateId, validateTradeItem, validateStatus, validateResult} = require('../middlewares/validator');
const router = express.Router();

router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.post("/", isLoggedIn, validateTradeItem, validateStatus, validateResult, controller.create);

router.get('/:id', validateId, controller.show)

router.get('/:id/edit', validateId, isLoggedIn, isCreator, controller.edit);

router.put('/:id', validateId, isLoggedIn, isCreator,  validateTradeItem, validateStatus, validateResult, validateResult,controller.update);

router.delete('/:id', validateId, isLoggedIn, isCreator, controller.delete);

router.get('/:id/trade', validateId, isLoggedIn, isNotCreator, controller.trade);

router.post('/:id/watch',validateId, isLoggedIn, isNotCreator, controller.watch);

router.put('/:id/unwatch', validateId, isLoggedIn, isNotCreator, controller.unwatch);

router.put('/:id/trade', validateId, isLoggedIn, isNotCreator, controller.offer);

router.get('/:id/manage', validateId, isLoggedIn, controller.manageOffer);

router.put('/:id/acceptOffer', validateId, isLoggedIn, isNotOfferCreator, controller.acceptOffer);

router.delete('/:id/cancelOffer', validateId, isLoggedIn, isOfferCreator, controller.cancelOffer);

router.delete('/:id/rejectOffer', validateId, isLoggedIn, isNotOfferCreator, controller.rejectOffer);

module.exports = router;
 