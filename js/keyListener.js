function KeyListener(){

    this.up = false;
    this.down = false;
    this.right = false;
    this.left = false;
    this.space = false;
    this.shift = false;
    this.mouse = false;
    this.context = false;
    this.x;
    this.y;
    
    var self = this;

    document.addEventListener("keydown", function(e){
        switch (e.keyCode) {
            case 87:
                self.up = true;
                break;
            case 83:
                self.down = true;
                break;
            case 65:
                self.left = true;
                break;
            case 68:
                self.right = true;
                break;
            case 32:
                self.space = true;
                e.preventDefault();
                break;
            case 16:
                self.shift = true;
                e.preventDefault();
                break;
        }
    }, false);


    document.addEventListener("keyup", function(e){
        switch (e.keyCode) {
            case 87:
                self.up = false;
                break;
            case 83:
                self.down = false;
                break;
            case 65:
                self.left = false;
                break;
            case 68:
                self.right = false;
                break;
            case 32:
                self.space = false;
                e.preventDefault();
                break;
            case 16:
                self.shift = false;
                e.preventDefault();
                break;
        }
    }, false);

    document.addEventListener( 'mousedown', function(e){
		switch (event.which) {
        case 1:
			//left click
        	self.x = e.clientX;
        	self.y = e.clientY;
        	self.mouse = true;
        	e.preventDefault();
            break;
        case 2:
			//middle click
            break;
        case 3:
			//right cklick
        	self.x = e.clientX;
        	self.y = e.clientY;
        	self.context = true;
        	e.preventDefault();
            break;
    	}

    }, false );

    document.addEventListener( 'mouseup', function(e){
        self.mouse = false;
        e.preventDefault();
    }, false );


	
    document.addEventListener( 'contextmenu', function(e){
        e.preventDefault();
    }, false );

}
