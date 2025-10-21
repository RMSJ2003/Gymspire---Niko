const APIFeatures = require('../utils/apiFeatures');
// Add catchAsync later

exports.deleteOne = Model => async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    // Add error
    if (!doc) console.error('No document found with that ID', 404);

    res.status(204).json({
        status: 'success',
        data: null
    });
};

exports.updateOne = Model => async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!doc) {
        console.error('No document found with that ID!');
        return;
    };

    res.status(200).json({
        status: 'success',
        data: { doc }
    });
};

exports.getAll = Model => async (req, res, next) => {
    let filter = {};

    const features = new APIFeatures(Model.find(filter), req.query);

    const doc = await features.query;

    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
};