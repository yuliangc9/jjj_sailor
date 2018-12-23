// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        angleShow: {
            default: null,
            type: cc.Label,
        },
        boat: {
            default: null,
            type: cc.Node,
        },
        angle:0,
    },

    isTouched: false,
    touchOldX: 0,
    touchOldY: 0,
    touchNewX: 0,
    touchNewY: 0,

    // LIFE-CYCLE CALLBACKS:

    beginTouch (x, y) {
        //console.log("begin touch");
        this.isTouched = true;
        this.touchOldX = x;
        this.touchOldY = y;
        this.touchNewX = x;
        this.touchNewY = y;
    },

    touching (x, y) {
        // console.log("touching");
        this.touchNewX = x;
        this.touchNewY = y;
    },

    endTouch () {
        // console.log("end touch");
        this.isTouched = false;

        this.node.runAction(cc.sequence(cc.rotateBy(Math.abs(this.angle)/90, -this.angle).easing(cc.easeElasticOut(0.5)),cc.callFunc(function() {

        }, this)));
    },

    onLoad () {
        this.node.zIndex = 200;
    },

    start () {
        this.oldR = this.node.rotation;
    },

    update (dt) {
        /*******************turn boat ************************/
        this.boat.getComponent("boat").turn(this.angle, dt);

        /******************auto roll back*********************/
        if (!this.isTouched) {
            //console.log(this.node.rotation, this.oldR, this.angle);
            var newR = this.node.rotation;
            var deltaR = newR - this.oldR;
            if (deltaR > 180) {
                deltaR = deltaR - 360;
            }
            if (deltaR < -180) {
                deltaR = 360 + deltaR;
            }

            this.angle += deltaR;
            this.angleShow.string = ""+parseInt(this.angle);
            
            this.oldR = this.node.rotation;
            return;
        }

        /*****************roll************************/
        var touchOldR = this.caculateRotation(this.touchOldX, this.touchOldY);
        var touchNewR = this.caculateRotation(this.touchNewX, this.touchNewY);

        var deltaR = touchNewR - touchOldR;
        if (deltaR > 180) {
            deltaR = deltaR - 360;
        }
        if (deltaR < -180) {
            deltaR = 360 + deltaR;
        }

        this.node.stopAllActions();

        this.angle += deltaR;
        this.node.rotation = this.angle;
        this.angleShow.string = ""+parseInt(this.angle);

        /******************finish*********************/
        this.touchOldX = this.touchNewX;
        this.touchOldY = this.touchNewY;
        this.oldR = this.node.rotation;
    },

    caculateRotation (x, y) {
        var deltaX = x - this.node.x;
        var deltaY = y - this.node.y;

        var targetRotation = 0;

        if (deltaY == 0 && deltaX == 0) {
            return 0;
        }

        if (deltaY == 0) {
            if (deltaX > 0) targetRotation = 0;
            if (deltaX < 0) targetRotation = 180;
        } else {
            targetRotation = Math.atan(deltaX/deltaY) * 180 / Math.PI;
            if (deltaY < 0) targetRotation += 90;
            if (deltaY > 0) targetRotation += 270;
        }

        return targetRotation;
    },

    onCollisionEnter (other, self) {
        this.node.game.addScore();
    },
});
