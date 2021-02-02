function LinkedList(){
    this.length = 0;

    this.first = null;
    this.last = null;

    var self = this;
    this.append = function(elem){
        if(self.length > 0){
            self.last.next = elem;
            elem.prev = self.last;
        } else {
            self.first = elem;
            elem.next = null;
            elem.prev = null;
        }
        self.last = elem;
        self.length++;

        elem.next = null;
    }

    this.removeFirst = function(){
        var name = self.first.name;
        if(self.length > 1){
            self.first = self.first.next;
            self.first.prev = null;
        } else {
            self.first = null;
            self.last = null;
        }

        self.length--;
    }

    this.remove = function(elem){
        if(self.length <= 1){
            self.first = null;
            self.last = null;
        } else {
            if(elem == self.first){
                self.first = elem.next;
                elem.next.prev = null;
            } else if (elem == self.last){
                self.last.prev.next = null;
                self.last = self.last.prev;
            } else {
                elem.prev.next = elem.next;
                elem.next.prev = elem.prev;
            }
        }

        self.length--;
    }
}

function NPC(object){
    this.object = object;
    this.name = "NPC";
}
function Bullet(object, speed){
    this.object = object;
    this.speed = speed;
    this.next = null;
    this.prev = null;
    this.name = "Bullet";
}

function Obstacle(object, center, speed, radius, angle){
    this.object = object;
    this.r_center = center;
    this.speed = speed;
    this.radius = radius;
    this.angle = angle;
    this.next = null;
    this.prev = null;
    this.name = "Obstacle";
}
