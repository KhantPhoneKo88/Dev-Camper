class ApiFeatures {
  constructor(query, queryString, totalDocs) {
    this.query = query;
    this.queryString = queryString;
    this.pagination = {};
    this.totalDocs = totalDocs;
  }
  filter() {
    const reqQuery = { ...this.queryString };
    // Removing Special Actions
    const excludedFields = ["select", "sort", "page", "limit"];
    excludedFields.forEach((el) => delete reqQuery[el]);

    //1 Advanced Filtering
    let queryString = JSON.stringify(reqQuery);
    queryString = queryString.replace(
      /\b(gt|gte|lt|lte|in)\b/g,
      (match) => `$${match}`
    );
    this.query = this.query.find(JSON.parse(queryString));
    return this;
  }
  select() {
    //2 Selecting
    if (this.queryString.select) {
      const fields = this.queryString.select.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select("-__v");
    }
    return this;
  }
  sort() {
    //3 Sorting
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }
    return this;
  }
  paginate() {
    //4 Pagination
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 2;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    if (endIndex < this.totalDocs) {
      this.pagination.next = {
        page: page + 1,
        limit,
      };
    }
    if (startIndex > 0) {
      this.pagination.prev = {
        page: page - 1,
        limit,
      };
    }

    this.query = this.query.skip(startIndex).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;
