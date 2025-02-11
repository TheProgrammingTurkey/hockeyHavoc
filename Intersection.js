const intersectionType = {
    None: 0,
    Simple: 1,
    Strict: 2
};

class Intersection {
    constructor(type, point) {
        this.type = type;
        if (point !== undefined) {
            this.point = point;
        }
    }
}