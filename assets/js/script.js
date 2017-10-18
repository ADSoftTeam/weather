$(function(){
	/* Configuration */
	var DEG = 'c';			// c - цельсий, f - фаренгейт
	var CITY = "Moscow,ru";
	var weatherDiv = $('#weather'),
		scroller = $('#scroller'),
		location = $('p.location');	
	function showWeather(position) {		
		try{
			var cache = localStorage[position] && JSON.parse(localStorage[position]);
			var d = new Date();			
			if(cache && cache.timestamp && cache.timestamp > d.getTime() - 30*60*1000){
				// Get the offset from UTC (turn the offset minutes into ms)
				var offset = d.getTimezoneOffset()*60*1000;
				var city = cache.data.city.name;
				var country = cache.data.city.country;
				console.log(DEG);
				$.each(cache.data.list, function(){
					var localTime = new Date(this.dt*1000 - offset);
					addWeather(
						this.weather[0].icon,
						moment(localTime).calendar(),	
						this.weather[0].main,
						' <b>' + convertTemperature(this.main.temp_min) + '°' + DEG +
						' / ' + convertTemperature(this.main.temp_max) + '°' + DEG+'</b>'
					);
				});
				// Город и страну отобразим
				location.html(city+', <b>'+country+'</b>');
				weatherDiv.addClass('loaded'); // прелоадер
				showSlide(0);
			} else {
				// Кэш старый или еще нет в локал сторадже				
				var weatherAPI = "http://api.openweathermap.org/data/2.5/forecast?q=" + position + "&units=metric&appid=35367433094594f2e9370b378db09bbb&lang=rus&units=metric";
				$.getJSON(weatherAPI, function(response){
					// В Кэш
					localStorage[position] = JSON.stringify({
						timestamp:(new Date()).getTime(),
						data: response
					});
					// Вызываем еще раз
					showWeather(position);
				});
			}
		}
		catch(e){
			showError("Нет информации по вашему городу!");
			window.console && console.error(e);
		}
	}

	function addWeather(icon, day, condition, temp){

		var markup = '<li>'+
			'<img src="assets/img/icons/'+ icon +'.png" />'+
			' <p class="day">'+ day +'</p> <p class="cond">'+ condition + '<br/>' + temp +
			'</p></li>';
		scroller.append(markup);
	}

	
	var currentSlide = 0;
	weatherDiv.find('a.previous').click(function(e){
		e.preventDefault();
		showSlide(currentSlide-1);
	});

	weatherDiv.find('a.next').click(function(e){
		e.preventDefault();
		showSlide(currentSlide+1);
	});


	function showSlide(i){
		var items = scroller.find('li');

		if (i >= items.length/4 || i < 0 || scroller.is(':animated')){
			return false;
		}

		weatherDiv.removeClass('first last');

		if(i == 0){
			weatherDiv.addClass('first');
		}
		else if (i == (items.length/4)-1){
			weatherDiv.addClass('last');
		}

		scroller.animate({left:(-i*800-i*4)+'px'}, function(){
			currentSlide = i;
		});
	}
	
	
	function convertTemperature(celsius){
		// Конвертация температур
		return Math.round(DEG == 'c' ? celsius : (celsius*9/5 +32));
	}

	function showError(msg){
		weatherDiv.addClass('error').html(msg);
	}
	
	$(".temp").change(function(){		
		DEG = this.value;
		scroller.html("");
		showWeather(CITY);
	});
	
	$("#town").change(function(){		
		CITY = this.value;
		console.log(CITY);
		scroller.html("");
		showWeather(CITY);
	});
	
	showWeather(CITY);
});
