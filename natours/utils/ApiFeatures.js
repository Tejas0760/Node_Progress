class apiFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    //Filtering
    filter() {
        const queryObj = { ...this.queryStr };
        const blocked = ['sort', 'page', 'limit', 'fields'];
        blocked.forEach((el) => delete queryObj[el]);

        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (rp) => `$${rp}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    //Sorting
    sort() {
        if (this.queryStr.sort) {
            const sortBy = this.queryStr.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt _id');
        }

        return this;
    }

    //Field Limiting
    fieldLimiting() {
        if (this.queryStr.fields) {
            const fields = this.queryStr.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v');
        }

        return this;
    }

    pagination() {
        const page = this.queryStr.page * 1 || 1;
        const limit = this.queryStr.limit * 1 || 100;
        const skip = (page - 1) * limit;

        this.query = this.query.skip(skip).limit(limit);

        // if (this.queryStr.page) {
        //     const numTours = await Tour.countDocuments();
        //     if (skip >= numTours) throw new Error("Page Dosen't exist");
        // }

        return this;
    }
}

module.exports = apiFeatures;
