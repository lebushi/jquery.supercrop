(function($){var types=['DOMMouseScroll','mousewheel'];$.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var i=types.length;i;){this.addEventListener(types[--i],handler,false)}}else{this.onmousewheel=handler}},teardown:function(){if(this.removeEventListener){for(var i=types.length;i;){this.removeEventListener(types[--i],handler,false)}}else{this.onmousewheel=null}}};$.fn.extend({mousewheel:function(fn){return fn?this.bind("mousewheel",fn):this.trigger("mousewheel")},unmousewheel:function(fn){return this.unbind("mousewheel",fn)}});function handler(event){var orgEvent=event||window.event,args=[].slice.call(arguments,1),delta=0,returnValue=true,deltaX=0,deltaY=0;event=$.event.fix(orgEvent);event.type="mousewheel";if(event.wheelDelta){delta=event.wheelDelta/120}if(event.detail){delta=-event.detail/3}deltaY=delta;if(orgEvent.axis!==undefined&&orgEvent.axis===orgEvent.HORIZONTAL_AXIS){deltaY=0;deltaX=-1*delta}if(orgEvent.wheelDeltaY!==undefined){deltaY=orgEvent.wheelDeltaY/120}if(orgEvent.wheelDeltaX!==undefined){deltaX=-1*orgEvent.wheelDeltaX/120}args.unshift(event,delta,deltaX,deltaY);return $.event.handle.apply(this,args)}})(jQuery);
/*TODO -
BASICS

FEATURES

more ideas:

*/

/*
 * SuperCrop v0.1 - jQuery plugin
 * Copyright (c) 2011 Stephan Reich
 *
 * Dual licensed under the MIT and GPL licenses:
 *     http://www.opensource.org/licenses/mit-license.php
 *     http://www.gnu.org/licenses/gpl.html
 *
 */

(function($){
   var SuperCrop = function(el, options){
		var     $el         	= $(el),
                that         	= this,
                opts    		= $.extend({}, $.fn.superCrop.defaults, options),
				html 			= $('<div class="supercrop_container"><div class="supercrop_resize"></div><div class="supercrop_resize_height"></div><div class="supercrop_resize_width"></div><div class="supercrop_inner"><img class="supercrop_image"/><div class="supercrop_buttonpane"><button class="supercrop_button supercrop_zoom_in">+</button><button class="supercrop_button supercrop_zoom_out">-</button></div><div class="supercrop_info">100%</div></div></div>'),
				buttonZoomIn	= $(".supercrop_zoom_in",html),
				buttonZoomOut	= $(".supercrop_zoom_out",html),
				buttonResizeWidth	= $(".supercrop_resize_width",html),
				buttonResizeHeight	= $(".supercrop_resize_height",html),
				buttonResize	= $(".supercrop_resize",html),

				image			= $(".supercrop_image",html),
				info			= $(".supercrop_info",html),
				
				zoomFactorPercentage = opts.stepSize,
				zoom			= 0,
				zooming			= false,
				xOff			= 0,
				yOff			= 0,
				resizing		= false;
				
				
				if(opts.imageUrl) image.attr("src",opts.imageUrl);
				$el.append(html);
			
				
				
				
		var		containerWidth,
				containerHeight,

 				imageWidth,
			 	imageHeight,

				currentImageWidth,
				currentImageHeight,

 				ratio,				
				//what gets subtracted/added from the width of the picture
				zoomFactor, 
				zoomFactorY;
			
			
			
	  			$el.data('SuperCrop', this);			        
				        
		
	//check	if any dependencies are violated in the default parameters
	function checkParameterDependencies(){
		
	};		
			
	function calculateDimensions(){
		
				containerWidth		= html.width();
				containerHeight		= html.height();

				if(!opts.width) containerWidth = html.parent().width();
				html.width(containerWidth);
				if(!opts.height) containerHeight = html.parent().height();
				html.height(containerHeight);

 				imageWidth 			= image.width();
			 	imageHeight 		= image.height();

				currentImageWidth 	= imageWidth;
				currentImageHeight 	= imageHeight;

 				ratio 				= imageWidth/imageHeight;
				
				//what gets subtracted/added from the width of the picture
				zoomFactor 			= imageWidth/(100/zoomFactorPercentage); 
				zoomFactorY 		= imageHeight/(100/zoomFactorPercentage);
				
				 
				console.log("width: " + containerWidth + "   height: " + containerHeight);		
			
				
	};
				
       /**DELETEME*/          
      function init(){           
	
 		image.mousedown(function(e){
		   //preventing default event from happening
		   e.preventDefault ? e.preventDefault() : e.returnValue = false;
		   
		   //calculate 
		   var imageOffset = $(this).offset();
		   startDrag(e.pageX-imageOffset.left,e.pageY-imageOffset.top);
		});

		
		buttonZoomOut.mousedown(function(e){zoomOut();});
		buttonZoomIn.mousedown(function(e){ zoomIn();});
		   
		
		//addingd fading animation to resizebars
		$.each([buttonResizeHeight,buttonResizeWidth],function(){ this.hover(
		    function() {if(!resizing)  $(this).stop(true,true).fadeTo(100,0.9);  },
		    function() { if(!resizing) $(this).stop(true,true).fadeTo(100,0);}
			);
		});
			
			
			
		//resize buttons	
	    buttonResizeWidth.mousedown(function(e){
		   e.preventDefault ? e.preventDefault() : e.returnValue = false;

	    	startResize($(this).offset().left,false);
	    	
		}).mouseup(function(e){
			stopResize();
		});
		
		
		
	    buttonResize.mousedown(function(e){
		   e.preventDefault ? e.preventDefault() : e.returnValue = false;

	    	startResize($(this).offset().left,$(this).offset().top);
	    	
		}).mouseup(function(e){
			stopResize();
		});
		
		
		
	   buttonResizeHeight.mousedown(function(e){
		   e.preventDefault ? e.preventDefault() : e.returnValue = false;

	    	startResize(false,$(this).offset().top);
		}).mouseup(function(e){
			stopResize();
		});
		

		html.bind('mousewheel', function(event, delta) {
		            var dir = delta > 0 ? 'Up' : 'Down',
		                vel = Math.abs(delta);
		            if(dir == "Up") zoomIn(true);
		            else zoomOut(true);
		            return false;
		 });
		
		
		image.load(function(){
			calculateDimensions();
		});
		
      };
      
      
  


       
///////////////////////////////////////////////////////



	function _updateOffset(){
		yOff = parseInt(image.css("top"));
		xOff = parseInt(image.css("left"));
	};




	//calculates..
	function refreshOffset(){
  
		//removing element offset before calculating the new offset 
	
//_updateOffset();
	//	currentImageHeight = image.height();
		
		//yOff -= html.offset().top;

		//remove html offset()
   		var tempYOff = yOff;//- html.offset().top;
		var tempXOff = xOff;//- html.offset().left;
		
		var tempXOffRoot = tempYOff;
		var tempYOffRoot = tempXOff;
    //	console.log("refreshOffset() ---- tempXOff: " + tempXOff  + " - " +  html.offset().left + "  tempYOff: " + tempYOff  + " -  " +  html.offset().top+ " image: " + currentImageHeight + " " + containerHeight + " - " + currentImageWidth + "  " + containerWidth + " zoom: " + zoom  + " ZoomFactorX: " + zoomFactor);
	
		//VERTICAL
		//if image-height is still larger then the container 
  		if(currentImageHeight > containerHeight){
			// A: if there is a margin on top
        	if(tempYOff>=0) tempYOff = 0; 	
			// B:  if there is a margin on bottom
		
        	 if((currentImageHeight-containerHeight) + (yOff) < 0 ) tempYOff = -(currentImageHeight-containerHeight);        
 		
			//if image is smaller then the container

    	}else{ 
    		tempYOff = 0;
    	}
		
		
	//	currentImageWidth = image.width();
	//	xOff -= html.offset().left;
		
   		
		//HORIZONTAL
		//MEWO
	   	 if(currentImageWidth > containerWidth){                                                                     
	   	     if(tempXOff>=0) tempXOff = 0;                                                                                    
	   	      if((currentImageWidth-containerWidth) + (xOff) < 0 ) tempXOff = -(currentImageWidth-containerWidth);   
                                                                                                                 
           
                                                                                                         
	   	 }else{
	   	 	tempXOff = 0;
	   	 }              
       	console.log("xOff: " + xOff + " tempXOff: " + tempXOff  + " html.offset.left- " +  html.offset().left + "  ciw - cw" + (currentImageWidth-containerWidth)  + "  " +   ( tempXOff - html.offset().left )   + "  " + ((currentImageWidth-containerWidth) + (xOff ) < 0 ) );
	    console.log("yOff: " + yOff + " tempXOff: " + tempYOff  + " html.offset.top- " +  html.offset().top + "  ciw - cw" + (currentImageWidth-containerWidth)  + "  " +   ( tempXOff - html.offset().left )   + "  " + ((currentImageWidth-containerWidth) + (yOff) < 0 ) );
									           	                                            
                                                                                                                 
	   //if(tempXOff != xOff|| tempYOff != yOff) 
	if(xOff != tempXOff) xOff= tempXOff;
 	if(yOff != tempYOff) yOff= tempYOff;
     _update(); //If something changed -> animate                                          
                                                                                                                 
	};                                                                                                       
	

	


	
	//checks if the container/image has no inner margins
	function imageInBounds(){
		
		//in case offset is out of sync due to stopped animation
		var yOffTemp = image.offset().top -html.offset().top,
		xOffTemp = image.offset().left-html.offset().left;
		
		
		if(yOffTemp  > 0 || ((currentImageHeight-containerHeight) + yOffTemp  < 0 ) 
		|| xOffTemp  > 0 || (currentImageWidth-containerWidth) + xOffTemp  < 0) 
			return false;
		else
			return true;
	};




	function calculateCenterRatio(){
		
		var imageCenter 	= {x:currentImageWidth/2,y:currentImageHeight/2},
			containerCenter = {x:containerWidth/2,y:containerHeight/2},
			// attention here: this value may only be working when no actual margin is allowed
			maxDistance 	= {		
								x:imageCenter.x - containerCenter.x,
							   	y:imageCenter.y - containerCenter.y
							},
		 	currentDistance	= {
								x:imageCenter.x - (containerCenter.x + Math.abs(xOff)),
				   				y:imageCenter.y - (containerCenter.y + Math.abs(yOff))
							},
			ratio 			= {
								x:Math.abs(currentDistance.x/maxDistance.x-3),
								y:Math.abs(currentDistance.y/maxDistance.y-3) //hmm
							};
			if(imageCenter.x < Math.abs(xOff)) currentDistance.x = Math.abs(xOff) - imageCenter.x;
			if(imageCenter.y < Math.abs(yOff)) currentDistance.y = Math.abs(yOff) - imageCenter.y;
			
			///RECALCULATE XOFF
		
			console.log("calculateCenterRatio() maxDistance: " +Math.round( maxDistance.x )+ " " +Math.round(maxDistance.y) + 
			" ---- currentDistance: " + Math.round(currentDistance.x) + " " + Math.round(currentDistance.y) + " ---- ratio: " + ratio.x + " " + ratio.y +
			" xOff: " + xOff + " yOff: " +yOff + 
			" imageCenter.x: " + imageCenter.x + " imageCenter.y : " +imageCenter.y );
		

		return ratio;
	};

		
   	//this would be much nicer, wouldn't it?
	function calculateCenteredOffset(newWidth,newHeight){
		var returnOffset = {x:0,y:0};
		
		//returnOffset.x = -(newWidth/2 - containerWidth/2);
		//returnOffset.y = -(newHeight/2 - containerHeight/2);
		returnOffset.x = -(((Math.abs(xOff)*2 + containerWidth)/2)-containerWidth/2);
		returnOffset.y = -(((Math.abs(yOff)*2 + containerHeight)/2)-containerHeight/2);
		
		if(newWidth < containerWidth)  returnOffset.x  = 0;
		if(newHeight < containerHeight)  returnOffset.y  = 0;
		return returnOffset;
	};


	//enlarges image one "step"
	function zoomIn(notAnimated){ 
  
    	zoom++;
		
		var	oldImageWidth 	= currentImageWidth;
		var	oldImageHeight 	= currentImageHeight;
		//value between 1 and two that allows centered zooming
		//it calculates the relative position of the image in the container
	
    	currentImageWidth= imageWidth+zoomFactor*zoom;
    	currentImageHeight= imageHeight+zoomFactorY*zoom;
    	
    	
		var ratio = calculateCenteredOffset(currentImageWidth,currentImageHeight);
		xOff=ratio.x;
		yOff=ratio.y;
	/*		
		
		var ratio = calculateCenterRatio();
		
		xOff-= (currentImageWidth - oldImageWidth)/ratio.x;
		yOff-= (currentImageHeight - oldImageHeight)/ratio.y;
*/


 		console.log("zoomIn: xOff: " + xOff  +  " currentImageWidth: " + currentImageWidth);
	
		_update();    


	};

	function zoomOut(notAnimated){
	   
 		zoom--;
 		if((100+zoomFactorPercentage*zoom) > opts.minZoom ){

			var	oldImageWidth = currentImageWidth,
				oldImageHeight = currentImageHeight;
				
	     	currentImageWidth= imageWidth+zoomFactor*zoom;
	    	currentImageHeight= imageHeight+zoomFactorY*zoom;
	        
	
	    	if(opts.limitToContainerFormat && (currentImageWidth < containerWidth || currentImageHeight < containerHeight )){
	                
	 			zoom++;
	     		currentImageWidth= imageWidth+zoomFactor*zoom;
	    		currentImageHeight= imageHeight+zoomFactorY*zoom;
	              
	    
	    	}else{
	    		
				var ratio = calculateCenteredOffset(currentImageWidth,currentImageHeight);
				xOff=ratio.x;
				yOff=ratio.y;
				
			/*	var ratio = calculateCenterRatio();
				xOff+= (oldImageWidth-currentImageWidth)/ratio.x;  
				yOff+= (oldImageHeight-currentImageHeight)/ratio.y;
				*/
				console.log("zoomOut-- xOffDifference: " +  (oldImageWidth-currentImageWidth) + " ratio.x: " + ratio.x + " xOff+= "  + (oldImageWidth-currentImageWidth)/ratio.x);
				console.log("zoomOut-- yOffDifference: " +  (oldImageHeight-currentImageHeight) + " ratio.y: " + ratio.y + " yOff+= "  + (oldImageHeight-currentImageHeight)/ratio.y);
				
		 	//	var callback = refreshOffset;
	        	_update(false,refreshOffset);
	
	    }
    }else{
    	zoom++;
    }
};


	//called on mousemove-event while dragging
	function mouseMove(e){
		xOff=e.pageX-e.data.xOffMouse;
		yOff=e.pageY-e.data.yOffMouse;
		
		_update(true);	  
		
		console.log("mouseMove  xOff: " + xOff + "  yOff: " + yOff + "  xOffMouse: " + e.data.xOffMouse + "  yOffMouse: " + e.data.yOffMouse  + " e.pageX: " + e.pageX + " e.pageY " + e.pageY  + " container.offset(): " + html.offset().left);
		
	};

	function startDrag(xOffMouse,yOffMouse){
		image.stop(true,false); // stopping all image animaations
		_updateOffset();
		
    	$(document).unbind("mousemove",mouseMove).bind("mousemove",{xOffMouse:xOffMouse,yOffMouse:yOffMouse},mouseMove);
		$(document).unbind("mouseup",stopDrag).mouseup(stopDrag);
		
	};
	


	function stopDrag(){
		$(document).unbind("mouseup",stopDrag);
    	$(document).unbind("mousemove",mouseMove);
		xOff-=html.offset().left;
		yOff-=html.offset().top;
		console.log("stopDrag()");
    	if(!imageInBounds()) 
		refreshOffset();
 		
	};



////////////////////////////////////////////////////////////////////////////////////


    function startResize(xOffMouse,yOffMouse){      	
    	resizing = true;		
    	$(document).unbind("mousemove",mouseMoveResize).bind("mousemove",{xOffMouse:xOffMouse,yOffMouse:yOffMouse},mouseMoveResize);
		$(document).unbind("mouseup",stopResize).mouseup(stopResize);
      	
    };
    function stopResize(){
    	resizing = false;		

		$(document).unbind("mouseup",stopResize);
    	$(document).unbind("mousemove",mouseMoveResize);
      	containerWidth = html.width();
      	containerHeight = html.height();
		
    	if(!imageInBounds()) 
		refreshOffset();
     };
      
	function mouseMoveResize(e){
		if(e.data.xOffMouse)
			html.width(containerWidth+e.pageX-e.data.xOffMouse);
		if(e.data.yOffMouse)
			html.height(containerHeight+e.pageY-e.data.yOffMouse);

	};





////////////////////////////////////////////////////////////////////////////////////

function _update(notAnimated,onFinishAnimation){
		image.stop(true,false); // stopping all image animaations
		//_updateOffset();
	
		if(notAnimated){ 
			image.width(Math.round(currentImageWidth));  
			image.offset({left:xOff,top:yOff});
			if(onFinishAnimation)	onFinishAnimation.call();
		
			
		}else{
			
    		image.stop(true,true).animate({
				width:Math.round(currentImageWidth),
				left:xOff,
				top:yOff},
				150,'linear',
				function(){
	    			if(onFinishAnimation)	onFinishAnimation.call();
 		 	});
  
		}
    	info.text((100+zoomFactorPercentage*zoom)+"%");
};


//////////////////////////////////////////////////////




  
    this.destroy = function(){};
	/**
	*
	**/
    this.getData = function(){
		return {
				offsetLeft:xOff,
				offsetTop:yOff,
				zoomFactor:currentImageWidth/imageWidth,
				imageWidth:currentImageWidth,
				imageHeight:currentImageHeight,
				cropWidth:containerWidth,
				cropHeight:containerHeight,
				imageUrl: opts.imageUrl
		};
	};
	//options.zoom,offset etc.
    this.changeImage = function(url,options){};

    
    
    init();    
   };
       
       
 
   $.fn.superCrop= function(options){
      return this.each(function(){
         (new SuperCrop(this,options));
      });
   };
    

  $.fn.superCrop.defaults = {
    limitToContainerFormat: true,
	maxZoom: 200,
	minZoom: 10,
	stepSize: 10,
	mouseWheel: true
//  allowZoom:true
//  incrementalZoom:false
//	allowResizeWidth:true
//	allowResizeHeight:true
//	maxWidth
// 	minWidth
//	maxHeight
//	minHeight
//	autoWidth
//	autoHeight
  };    

 
})(jQuery);



