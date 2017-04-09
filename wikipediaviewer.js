/*
    This app lets one view Wikipedia articles by searching for them.
    Users can also choose to read a random article.
*/

//Creates a div with title, description and link of the article.
function createDiv(title, description, link) {
    if (description === "") {
        description = "No description to show.";
    }
    else {
        description = spaceCheck(description);
    }
    var appendString = "";
    appendString += "<a class = wikipedia-link target = '_blank' href = '"+link+"'>";
    appendString += "<div class = 'article-container'>";
    appendString += "<div class = 'article-title'>"+title+"</div>";
    appendString += "<div class = 'article-description'>"+description+"</div>";
    appendString += "</div>";
    appendString += "</a>";
    $('#all-articles').append(appendString);
    $('#search-box').autocomplete('close');
}

//Deletes all existing divs.
function deleteDivs() {
    $('.wikipedia-link').remove();
    $('.article-container').remove();
    $('.no-results-found').remove();
}

//Makes sure the formatting for the description is correct so it does not span outside the div.
function spaceCheck(description) {
    var descriptionLength = description.length;
    var newStr = '';
    var counter = 0;
    for (var i = 0; i < descriptionLength; i++) {
        if (description[i] === ' ') {
            counter = 0;
            newStr += description[i]; 
        } else {
            counter++;
            if (counter >= 60) {
                newStr += description[i] + "<br>";
                counter = 0;    
            } else {
                newStr += description[i];
            }
        }
    }
    
    return newStr;
}

//gets JSON from Wikipedia based on search.
function wikiJSON() {
    var searchStr = $('#search-box').val();
    $.getJSON("https://en.wikipedia.org/w/api.php?callback=?&action=opensearch&search="+searchStr+"&format=json", function(data) {
        var resultsObj = {
            title: [],
            description: [],
            link: []
        };
        data[1].forEach(function(element) {
            resultsObj.title.push(element);
        });
        data[2].forEach(function(element) {
            resultsObj.description.push(element);
        });
        data[3].forEach(function(element) {
            resultsObj.link.push(element);
        });
        deleteDivs();
        if (resultsObj.title.length === 0) {
            $('body').append("<div class = 'no-results-found'>Sorry, there were no results found for your search.</div>");
        }
        for (var i = 0; i < resultsObj.title.length; i++) {
            createDiv(resultsObj.title[i], resultsObj.description[i], resultsObj.link[i]);
        }
    });
}

//Generates 3 random articles.
function randomArticle() {
    deleteDivs();
    $('#search-box').attr("value", "");
    for (var i = 0; i < 3; i++) {
        $.getJSON("https://en.wikipedia.org/w/api.php?action=query&generator=random&grnnamespace=0&prop=extracts&explaintext&exintro=&format=json&callback=?", function(data) {
            var pageID = Object.keys(data.query.pages);
            createDiv(data.query.pages[pageID].title, data.query.pages[pageID].extract, "http://en.wikipedia.org/?curid="+pageID+"");
        });
    }
}

//Ready function.
$(document).ready(function() {
    //Calls JSON function.
    $('.search-icon-container').click(function() {
        wikiJSON();
    });
    //To enable pressing enter on search box.
    $('#search-box').keypress(function(e){
        $('#search-box').autocomplete('close');
        if (e.which == 13){
            $('.search-icon-container').click();
        }
    });
    //autocomplete method from jQuery supported by Wikipedia.
    $("#search-box").autocomplete({
        source: function(request, response) {
            $.ajax({
                url: "http://en.wikipedia.org/w/api.php",
                dataType: "jsonp",
                data: {
                    'action': "opensearch",
                    'format': "json",
                    'search': request.term
                },
                success: function(data) {
                    response(data[1]);
                }
            });
        }
    });
    
    //Random button click event.
    $('.random-button').click(function() {
        randomArticle();
    });
});