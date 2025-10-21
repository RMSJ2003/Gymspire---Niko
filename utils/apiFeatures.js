class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // validating queries entered by user.
        const queryObj = {
            ...this.queryString
        };
        // We exclude these cuz they have different functionalities with filter(). 
        const excludedFields = ['page', 'sort', 'limit', 'fields']; // we need these elements.

        excludedFields.forEach(el => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);

        // we added backslash b cuz we only want to match the exact gte, etc. 
        // we don't want to match a word that contains gte, etc.
        // we added g in the end cuz we want to it to happen multiple times so if we have many operators
        // then it will replace all of them. Basically we are adding a dollar sign
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));

        this.query = this.query.find(JSON.parse(queryStr));

        return this; // return this object so we can chain other methods
    }
}

module.exports = APIFeatures;