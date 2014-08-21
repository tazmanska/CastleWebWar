var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};
Vector.prototype.getLength = function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

