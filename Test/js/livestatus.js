jQuery(document).ready(function($) {
$('.ltwitch').each(function () {
    var tnick = $(this).data('tnick');
    var span = $(this).next();
    $.getJSON("https://api.twitch.tv/kraken/streams/"+tnick+".json?callback=?",       function(c) {
        if (c.stream == null) {
            span.html("Offline").css("color", "red");
        } else {
            span.html("Online").css("color", "green");
			
        }
    });
});
});

var MLGStreams = (function() {
    return {
        fetchStreamData: function() {
            return $.ajax({
                url: "http://www.majorleaguegaming.com/api/channels/all?fields=slug,stream_name",
                jsonp: "callback",
                dataType: "jsonp"
            });
        },
        
        fetchStreamActivity: function() {
            return $.ajax({
                url: "http://streamapi.majorleaguegaming.com/service/streams/all",
                jsonp: "callback",
                dataType: "jsonp"
            });
        },
        
        getStreamStatus: function(slug, stream_data, stream_activity) {
            for(var i = 0; i < stream_data.length; i++) {
                if(stream_data[i].slug == slug) {
                    for(var j = 0; j < stream_activity.length; j++) {
                        if(stream_data[i].stream_name == stream_activity[j].stream_name) {
                            switch(stream_activity[j].status) {
                                case 1: return "Online";
                                case 2: return "Replay";
                                default: return "Offline";
                            }
                        }
                    }
                }
            }
			
			return "Offline";
        }
    }
})();

jQuery(document).ready(function($) {
    $.when(MLGStreams.fetchStreamData(), MLGStreams.fetchStreamActivity()).done(function(stream_data, stream_activity){
		$('.lmlg').each(function () {
			var tnick = $(this).data('tnick');
			var span = $(this).next();
			span.html(MLGStreams.getStreamStatus(tnick, stream_data[0].data.items, stream_activity[0].data.items));
		});
    });
});
