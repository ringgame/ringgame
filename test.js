/**
 * Created by gast-c02 on 07.05.14.
 */
document.addEventListener( 'mousedown', function(e){
    console.log(self.mouse);
    e.preventDefault();
}, false );

document.addEventListener( 'mouseup', function(e){
    console.log(self.mouse);
    e.preventDefault();
}, false );
