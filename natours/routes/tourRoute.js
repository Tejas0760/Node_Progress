const express = require('express');
const tourController = require('./../controller/tourController');
const authController = require('./../controller/authController');
const reviewRouter = require('./../routes/reviewRoute');

const router = express.Router();

// router.param('id', tourController.checkID);

router.use('/:tourId/reviews', reviewRouter);

router
    .route('/top-5-cheap')
    .get(tourController.aliasTopTours, tourController.getAllTours);

// Mongo Aggerate
router.route('/agg').get(tourController.aggerationTrial);
router
    .route('/rp/:year')
    .get(
        authController.protect,
        authController.restrictTo('admin', 'lead-gude', 'guide'),
        tourController.realProb
    );

router
    .route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getTourWithIn);

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//(Improved Routing for more clean code) ( Can chain various requests together )
router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.protect,
        authController.restrictTo('lead-guide', 'admin'),
        tourController.addNewTour
    );

router
    .route('/:id')
    .get(tourController.getTourById)
    .patch(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.updateTour
    )
    .delete(
        authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.deleteTour
    );

module.exports = router;
