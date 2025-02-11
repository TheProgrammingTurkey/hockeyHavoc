class Contact{
    constructor(a, b) {
        this.a           = a;
        this.b           = b;
        this.normal      = new Vec2(0, 1);
        this.impulse     = 0;
        this.penetration = 0;
    }
}