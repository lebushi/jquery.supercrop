(function($){var types=['DOMMouseScroll','mousewheel'];$.event.special.mousewheel={setup:function(){if(this.addEventListener){for(var i=types.length;i;){this.addEventListener(types[--i],handler,false)}}else{this.onmousewheel=handler}},teardown:function(){if(this.removeEventListener){for(var i=types.length;i;){this.removeEventListener(types[--i],handler,false)}}else{this.onmousewheel=null}}};$.fn.extend({mousewheel:function(fn){return fn?this.bind("mousewheel",fn):this.trigger("mousewheel")},unmousewheel:function(fn){return this.unbind("mousewheel",fn)}});function handler(event){var orgEvent=event||window.event,args=[].slice.call(arguments,1),delta=0,returnValue=true,deltaX=0,deltaY=0;event=$.event.fix(orgEvent);event.type="mousewheel";if(event.wheelDelta){delta=event.wheelDelta/120}if(event.detail){delta=-event.detail/3}deltaY=delta;if(orgEvent.axis!==undefined&&orgEvent.axis===orgEvent.HORIZONTAL_AXIS){deltaY=0;deltaX=-1*delta}if(orgEvent.wheelDeltaY!==undefined){deltaY=orgEvent.wheelDeltaY/120}if(orgEvent.wheelDeltaX!==undefined){deltaX=-1*orgEvent.wheelDeltaX/120}args.unshift(event,delta,deltaX,deltaY);return $.event.handle.apply(this,args)}})(jQuery);



/*
 * SuperCrop v0.1 - jQuery plugin
 * Copyright (c) 2011 Stephan Reich
 *
 * Dual licensed under the MIT and GPL licenses:
 *     http://www.opensource.org/licenses/mit-license.php
 *     http://www.gnu.org/licenses/gpl.html
 *
 *  TODO:
 * 	- add auto width/height defaults
 * 	- put  width/height & x/y variables into js-objects (minContainerSize,imageOffset)
 *  - aspect ratio
 * 	- resize animations
 */

(function($){	
   var SuperCrop = function(el, options){
		var     $el         	= $(el),
                that         	= this,
                opts    		= $.extend({}, $.fn.superCrop.defaults, options),
				html 			= $('<div class="supercrop_container"><div class="supercrop_loader"></div><div class="supercrop_overlay_bottom"></div><div class="supercrop_overlay_right"></div><div class="supercrop_inner"><div class="supercrop_hello"><div class="supercrop_resize"></div><div class="supercrop_resize_height"><div class="handle"></div></div><div class="supercrop_resize_width"><div class="handle"></div></div><img class="supercrop_image"/></div></div><div class="supercrop_buttonpane"><button class="supercrop_button supercrop_zoom_in"></button><button class="supercrop_button supercrop_zoom_out"></button></div><div class="supercrop_info">100%</div></div>'),
		
				buttonZoomIn	= $(".supercrop_zoom_in",html),
				buttonZoomOut	= $(".supercrop_zoom_out",html),
				buttonResizeWidth	= $(".supercrop_resize_width",html),
				buttonResizeHeight	= $(".supercrop_resize_height",html),
				buttonResize	= $(".supercrop_resize",html),
				overlayRight	= $(".supercrop_overlay_right",html),
				overlayBottom	= $(".supercrop_overlay_bottom",html),

				buttonResize	= $(".supercrop_resize",html),
				loader			= $(".supercrop_loader",html),
				htmlInner  		= $(".supercrop_hello",html),

				image			= $(".supercrop_image",html),
				info			= $(".supercrop_info",html),
								
				zooming			= false,
				resizing		= false,
				dragging        = false,
		     	initialized     = false,

				zoom,xOff,yOff,containerWidth, containerHeight,				
 				imageWidth, imageHeight,
				currentImageWidth, currentImageHeight,zoomFactorPercentage,
 				ratio,
 				
 				//offset, currentImageSize, rootImageSize, canvasSize, cropSize,				
				//what gets subtracted/added from the width of the picture
				zoomFactor,	zoomFactorY;
			
			
			
		$el.append(html);
		$el.data('SuperCrop', this);			        
		init();		        
		


   function init(){
   	       	    
    	containerWidth		= opts.width;
		containerHeight		= opts.height;
   	    
		zoom = (opts.zoom/10)-10;

		xOff = opts.xOffset;
		yOff = opts.yOffset;
   	    
		zoomFactorPercentage = opts.stepSize; //rename

   	    
  	    if(!initialized) _initUi();
   	    
   	    _initContainer(); 
   	    
   	   	if(opts.imageUrl) _initImage();		
		if(opts.onInit) opts.onInit.call();
		
		initialized=true;
   };		
   
  

	function _initContainer(){
	

		if(!opts.width) containerWidth = html.parent().width();  //maybe only on width:auto!?
		if(!opts.height) containerHeight = html.parent().height();
		htmlInner.width(containerWidth);
		htmlInner.height(containerHeight);

		_updateOverlay(containerWidth,containerHeight);

		if(opts.minOuterWidth) html.css("min-width",opts.minOuterWidth+"px");
		if(opts.minOuterHeight) html.css("min-height",opts.minOuterHeight+"px");
		
	};

	function _initImage(){
		
		image.attr("src",opts.imageUrl);
		
	//	refreshOffset();
	
		loader.show();
		image.load(function(){ //may cause problems if image is already loaded ->
			loader.fadeOut(180);
			
			_calculateDimensions(); //recalculate sizes & ratios
			image.css("width","auto").css("height","auto");	// reset image size			
			if(zoom != 0) zoomTo(zoom);
			_update();
			
		});
		/*image.ready(function(){
			loader.hide();
		});*/
				
	};		
			

	function _calculateDimensions(){		
		
 				imageWidth 			= image.width();
			 	imageHeight 		= image.height();	
	
				currentImageWidth 	= imageWidth;
				currentImageHeight 	= imageHeight;


				if(imageWidth < html.width()){   //relocate
					containerWidth = imageWidth;
					htmlInner.width(containerWidth);				 
					
				}
				if(imageHeight < html.height()){ 
					containerHeight = imageHeight;
					htmlInner.height(containerHeight);				 
					
				}				
				_updateOverlay(containerWidth,containerHeight);

 				ratio 				= imageWidth/imageHeight;
				
				//what gets subtracted/added from the width of the picture
				zoomFactor 			= imageWidth/(100/zoomFactorPercentage); 
				zoomFactorY 		= imageHeight/(100/zoomFactorPercentage);				
				 
				_debug("width: " + containerWidth + "   height: " + containerHeight);				
				
	};
	

   function _initUi(){        
	
		//init image dragging
		image.mousedown(function(e){
		   //preventing default event from happening
		   e.preventDefault ? e.preventDefault() : e.returnValue = false;
		   
		   //calculate mouse offset
		   var imageOffset = $(this).offset();
		   startDrag(e.pageX-imageOffset.left, e.pageY-imageOffset.top);
		});
	
	//check for ie issue: http://stackoverflow.com/questions/5855135/css-pointer-events-property-alternative-for-ie
		
		//init zoom
		if(opts.allowZoom){
			buttonZoomOut.mousedown(function(e){zoomOut();});
			buttonZoomIn.mousedown(function(e){ zoomIn();});		   
			
			html.bind('mousewheel', function(e, delta) {
					   e.preventDefault ? e.preventDefault() : e.returnValue = false;

			            var dir = delta > 0 ? 'Up' : 'Down',
			                vel = Math.abs(delta);
			            if(dir == "Up") zoomIn(true);
			            else zoomOut(true);
			          
			            return false;
			 });		
		}
		//init container resizing
		if(opts.allowResizeWidth){				
		    buttonResizeWidth.mousedown(function(e){
			   e.preventDefault ? e.preventDefault() : e.returnValue = false;
		    	startResize($(this).offset().left,false);	    	
			});
			
		}else{
			buttonResizeWidth.hide()
		}
		
		if(opts.allowResizeHeight){		
		   buttonResizeHeight.mousedown(function(e){
			   e.preventDefault ? e.preventDefault() : e.returnValue = false;
		    	startResize(false,$(this).offset().top);
			});
		}else{
			buttonResizeHeight.hide();
		}	
			
		if(opts.allowResizeHeight && opts.allowResizeWidth){	
	   		
	   		buttonResize.mousedown(function(e){
			  e.preventDefault ? e.preventDefault() : e.returnValue = false;
		      startResize($(this).offset().left,$(this).offset().top);	    	
			});
			
		/*	buttonResize.hover(
			   function() {if(!resizing && !dragging){  fadeTo(buttonResizeHeight,0.7); fadeTo(buttonResizeWidth,0.7); }},
			   function() { if(!resizing && !dragging){ fadeTo(buttonResizeHeight,0,180,400); fadeTo(buttonResizeWidth,0,180,400); }}			   
			);
			*/
		}


        if(opts.fadeToolsOnHover){
	        var elements = $(".supercrop_buttonpane, .supercrop_info",html);
	        fadeTo(elements,0,100);
	        html.hover(
				   function() { if(!resizing)  fadeTo(elements,1); },
				   function() { if(!resizing) fadeTo(elements,0,180,400); }				   
			);
		}
	
		
		handleHover(buttonResizeHeight);  
  		handleHover(buttonResizeWidth);
  	 	handleHover(buttonResize);

        

        //makes buttons hoverable
        function handleHover(element){
        	var mouseOut = false;
        	element.hover(
        		function(){ mouseOut=false; if(!resizing && !dragging)  fadeTo($(this),0.8);},
        		function(){ mouseOut=true;  if(!resizing && !dragging) fadeTo($(this),0,100,300)}
        	);
        
        	element.bind("mousedown",function(){
        		$(document).bind("mouseup").bind("mouseup",fadeOut);
        	});
        	        	
        	function fadeOut(){
        		if(mouseOut){
        		  fadeTo(element,0);        		
    		      $(document).unbind("mouseup",fadeOut);
    		    }
        	};
        };
        
        
		function fadeTo(element,opacity,duration,delay){
			if(!delay) delay = 0;
			if(!duration) duration = 100;
        	element.stop(true,true).delay(delay).fadeTo(duration,opacity);
        };
        
		//init image dimensions
		/*image.load(function(){
			
			calculateDimensions();
		});*/


		
  };
      
  //removes all handlers and
  function disableUi(){
  	html.unbind('mousewheel');
  	image.unbind("mousedown");
  

  	$.each([buttonResizeHeight,buttonResizeWidth,buttonZoomOut,buttonZoomIn],function(){
  			$(this).hide();
  			$(this).unbind("mousedown");
  	});
  };
  //removes all handlers and
  function enableUi(){
  	$.each([buttonResizeHeight,buttonResizeWidth,buttonZoomOut,buttonZoomIn],function(){
  			$(this).show();
  	});
  	initUi();
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
		//currentImageHeight = image.height();
		
		//yOff -= html.offset().top;

		//remove html offset()
   		var tempYOff = yOff;//- html.offset().top;
		var tempXOff = xOff;//- html.offset().left;
		
		var tempXOffRoot = tempYOff;
		var tempYOffRoot = tempXOff;
    //	_debug("refreshOffset() ---- tempXOff: " + tempXOff  + " - " +  html.offset().left + "  tempYOff: " + tempYOff  + " -  " +  html.offset().top+ " image: " + currentImageHeight + " " + containerHeight + " - " + currentImageWidth + "  " + containerWidth + " zoom: " + zoom  + " ZoomFactorX: " + zoomFactor);
	
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
	   	 if(currentImageWidth > containerWidth){                                                                     
	   	     if(tempXOff>=0) tempXOff = 0;                                                                                    
	   	      if((currentImageWidth-containerWidth) + (xOff) < 0 ) tempXOff = -(currentImageWidth-containerWidth);   
                                                                                                                 
           
                                                                                                         
	   	 }else{
	   	 	tempXOff = 0;
	   	 }              
       	_debug("xOff: " + xOff + " tempXOff: " + tempXOff  + " html.offset.left- " +  html.offset().left + "  ciw - cw" + (currentImageWidth-containerWidth)  + "  " +   ( tempXOff - html.offset().left )   + "  " + ((currentImageWidth-containerWidth) + (xOff ) < 0 ) );
	    _debug("yOff: " + yOff + " tempXOff: " + tempYOff  + " html.offset.top- " +  html.offset().top + "  ciw - cw" + (currentImageWidth-containerWidth)  + "  " +   ( tempXOff - html.offset().left )   + "  " + ((currentImageWidth-containerWidth) + (yOff) < 0 ) );
									           	                                            
                                                                                                                 
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




		
   	//this would be much nicer, wouldn't it?
   	//calculates the new that allows centered zooming
	function calculateCenteredOffset(newWidth,newHeight,oldWidth,oldHeight){
		var centerRatio = { 
							x:  (Math.abs(xOff) + containerWidth/2) / oldWidth,
							y:  (Math.abs(yOff) + containerHeight/2) /oldHeight
						};
		
		var returnOffset = {
							x: -(centerRatio.x*newWidth - containerWidth/2),
							y: -(centerRatio.y*newHeight - containerHeight/2)
						};
		
		_debug("calculateCenteredOffset() - centerRatio x: " + centerRatio.x + " y: " + centerRatio.y + "   xOff: " + xOff + "  yOff: " + yOff ); 
		
		if(newWidth + returnOffset.x<= containerWidth || ( newWidth < oldWidth && xOff == 0 ))  returnOffset.x  = 0;
		if(newHeight + returnOffset.y <= containerHeight || (newHeight < oldHeight && yOff == 0 ))  returnOffset.y  = 0;
		
		
		return returnOffset;
	};


	
	
	
	function zoomTo(value,soft){
		zoom = value;
		
		var	oldImageWidth 	= currentImageWidth;
		var	oldImageHeight 	= currentImageHeight;
		
		currentImageWidth= imageWidth+zoomFactor*zoom;
    	currentImageHeight= imageHeight+zoomFactorY*zoom;
    	
    //	alert(oldImageWidth  +  " " + currentImageWidth);
    	
		var ratio = calculateCenteredOffset(currentImageWidth,currentImageHeight,oldImageWidth,oldImageHeight);
		
		xOff = ratio.x;
		yOff = ratio.y;
		
		if(!soft) _update();    	

	}; 


	//enlarges image one "step"
	function zoomIn(){ 
			if((100+zoomFactorPercentage*(zoom+1)) <= opts.maxZoom )	zoomTo(zoom+1);
	};


	function zoomOut(){
	 		if((100+zoomFactorPercentage*zoom) > opts.minZoom && _checkMinimum())  zoomTo(zoom-1);
	 		
	 		
	 		function _checkMinimum(){
	 			if(opts.limitToContainerFormat &&  ( imageWidth+zoomFactor*(zoom-1) < containerWidth || imageHeight+zoomFactorY*(zoom-1) < containerHeight)) return false;
	 			else return true;
	 		};

	};
	


	//called on mousemove-event while dragging
	function mouseMove(e){
		
		//IE 7-8 necessary
		if(!e) 	e = window.event;
		    	e.preventDefault();
		
		xOff=e.pageX-e.data.xOffMouse;
		yOff=e.pageY-e.data.yOffMouse;
		
		_update(true);	  
		
		_debug("mouseMove  xOff: " + xOff + "  yOff: " + yOff + "  xOffMouse: " + e.data.xOffMouse + "  yOffMouse: " + e.data.yOffMouse  + " e.pageX: " + e.pageX + " e.pageY " + e.pageY  + " container.offset(): " + html.offset().left);
		
	};

	function startDrag(xOffMouse,yOffMouse){
		image.stop(true,false); // stopping all image animaations
		_updateOffset();
    	$(document).unbind("mousemove",mouseMove).bind("mousemove",{xOffMouse:xOffMouse,yOffMouse:yOffMouse},mouseMove);
		$(document).unbind("mouseup",stopDrag).mouseup(stopDrag);
		dragging = true;
		
	};
	


	function stopDrag(){
		$(document).unbind("mouseup",stopDrag);
    	$(document).unbind("mousemove",mouseMove);
		xOff-=html.offset().left;
		yOff-=html.offset().top;
		_debug("stopDrag()");
    	if(!imageInBounds()) 
		refreshOffset();
		dragging = false;
 		
	};



////////////////////////////////////////////////////////////////////////////////////


    function startResize(xOffMouse,yOffMouse){      	
    	resizing = true;		
    	$(document).unbind("mousemove",mouseMoveResize).bind("mousemove",{xOffMouse:xOffMouse,yOffMouse:yOffMouse},mouseMoveResize);
		$(document).unbind("mouseup",stopResize).mouseup(stopResize);
      	        html.addClass("supercrop_active");

    };
    
    
    function stopResize(){
    	resizing = false;		

        html.removeClass("supercrop_active");
		$(document).unbind("mouseup",stopResize);
    	$(document).unbind("mousemove",mouseMoveResize);
    
      	containerWidth = htmlInner.width();
      	containerHeight = htmlInner.height();
		
    	if(!imageInBounds()) 
		refreshOffset();
     };
      
	function mouseMoveResize(e){
	
		if(!e) 	e = window.event;
    	e.preventDefault();
	
		if(e.data.xOffMouse){
			var newWidth = containerWidth + e.pageX-e.data.xOffMouse-9;
			
			if(	newWidth > opts.minWidth &&( opts.maxWidth == 0 ||  newWidth < opts.maxWidth)){
				htmlInner.width(newWidth);
				
				_updateOverlay(newWidth,false);
				
		
			}
		}
		if(e.data.yOffMouse){
			var newHeight = containerHeight+e.pageY-e.data.yOffMouse-9;
			if(newHeight > opts.minHeight &&( opts.maxHeight == 0 ||  newHeight < opts.maxHeight)){
				 htmlInner.height(newHeight);
 	
				_updateOverlay(false,newHeight);

		
			}
		}
		
		
		if(opts.onChange) opts.onChange.call();
	};



 function _updateOverlay(currentWidth,currentHeight){
 	if(currentHeight){
	 	 if(currentHeight <  opts.minOuterHeight)  overlayBottom.height(opts.minOuterHeight - currentHeight);
		 else overlayBottom.height(0);
	 }
	 
	if(currentWidth){ 
	    if(currentWidth <  opts.minOuterWidth) overlayRight.width(opts.minOuterWidth -currentWidth);
		else overlayRight.width(0);
		overlayBottom.width(currentWidth);
	}
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
    	
		if(opts.onChange) opts.onChange.call();

};


function _debug(string){
	if(opts.devmode && string && !$.browser.msie && window.console && console.debug) console.log(string);
};

//////////////////////////////////////////////////////




    this.disable = function(){};
	this.enable = function(){};
    this.destroy = function(){};
	/**
	*
	**/
	
	this.showLoader = function(){
		loader.show();
	};
	
	this.hideLoader = function(){
		loader.fadeOut(180);
	};	
	
    this.setImage = function(url){
    	this.setData({imageUrl:url});
    	
    };
    this.removeImage = function(){
    	opts.imageUrl =false;
		image.attr("src","");
    	
    };
    this.setData = function(data){
    	 $.extend(true, opts, data);  	
		if(!data.zoom) opts.zoom = 100;
		if(!data.width) opts.width=containerWidth;
		if(!data.height) opts.height=containerHeight;
 		init();
    };
   
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

    
    
        
   };
       
       
 
   $.fn.superCrop= function(options){
      return this.each(function(){
         (new SuperCrop(this,options));
      });
   };
    

  $.fn.superCrop.defaults = {
  	
	    limitToContainerFormat: false,
	    imageUrl: false,
		zoom: 100, 
		stepSize: 10,
	    allowZoom:true, 
	    mouseWheel: true,
	    
		maxZoom: 140,	// percentage
		minZoom: 10,
		
		maxWidth: 900, 	//make it an array -> maxWidth, maxHeight  or  maxContainerSize.width & .height or 
		minWidth: 40, 
				
		maxHeight: 400,  // minSize[] or {}
		minHeight: 80,		

		minOuterWidth: 350,  //minContainerSize
		minOuterHeight: 160,
		
		allowResizeWidth:true,	
		allowResizeHeight:true,
		
		xOffset: 0,		//array -> offset or javascript-object  offset.left
		yOffset: 0,
		onChange: false,
		onInit: false,
	    fadeToolsOnHover: false,
		
		devmode: true
		
		//maxContainerSize : {width:auto, height aujto},
		//minContainerSize : {width:80, height 80},

		//maxCropSize : {width:900, height 400},
		//minCropSize : {width:200, height 200},
		
		//maxImageSize : {width:false, height false},
		//minImageSize : {width:false, height false},		
		
		//offset : {left:0,top:0}
		
	//  disableAnimations
	// 	fitToContainerSize
	//	onInit
	//  onResize, onDoneResizing, onDragImage, onDropImage, onZoom
	//  onAfterChange
	//  incrementalZoom:false
	//  maxImageWidth, maxImageHeight, minImageHeight, minImageWidth
  };    

 
})(jQuery);



