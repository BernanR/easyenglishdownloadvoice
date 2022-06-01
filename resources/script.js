const indexedDB =
window.indexedDB ||
window.mozIndexedDB ||
window.webkitIndexedDB ||
window.msIndexedDB ||
window.shimIndexedDB;

var applicationStart = function(db) {

var DB;

if (db) {
    DB = {
        save : function(sentence, calback) {
            var transaction = db.transaction(["sentences"], "readwrite");
            var objectStore = transaction.objectStore("sentences");
            var request = objectStore.add(sentence);

            request.onsuccess = event => {
                calback()
            };
        },
        list : function(calback) {
            var transaction = db.transaction(["sentences"]);
            var objectStore = transaction.objectStore("sentences");
            var request = objectStore.getAll();               
            request.onsuccess = event => {
                calback(request.result)
            };
            //calback();
        },
        delete : function(url, calback) {
            var request = db.transaction(["sentences"], "readwrite")
            .objectStore("sentences")
            .delete(url);
            request.onsuccess = event => {
                calback()
            };
        }
    }

    DB.list(function(sentences) {
        sentences.forEach(sentence => {
            addAudio(sentence.text, sentence.url);
        });
    });

}

let watch = function() {
    buttonsDisabled(true);
    setInterval(function () {
        if ($(".text").val().length > 0) {
            buttonsDisabled(false);                
        } else {
            buttonsDisabled(true);
        }
    }, 50);
}

$(".link").on('click', function() {
    let url = generatorLink();
    window.open(url, '_blank');
    return false;
})

$(".btn-save").on('click', function() {
    let url = generatorLink();
    let text = $(".text").val();            
    
    let prependUl = function() {
        addAudio(text, url)
    }

    DB.save({url: url, text: text}, prependUl);
})        

let generatorLink = function () {
    let text = $(".text").val();
    let words = text.split(' ');
    let part = words.join('%20')
    let url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${part}.&tl=en&total=1&idx=0&textlen=15&tk=350535.255567&client=webapp&prev=input`;
    return url;
}

let buttonsDisabled = function(action) {
    $(".link").attr('disabled', action);
    $(".btn-save").attr('disabled', action);
}

let addAudio = function(text, url) {
    let ul = $(".ls-voice-cont");
    let li = $(`
        <li>
            <p class="text-voice">${text}</p>
            <audio controls>
                <source src="${url}" type="audio/mpeg">
                Your browser does not support the audio element.
            </audio>
            <button type="button" class="btn btn-light btn-delete" data-toggle="tooltip" data-placement="top" title="Remover from saved">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash3-fill" viewBox="0 0 16 16">
                    <path d="M11 1.5v1h3.5a.5.5 0 0 1 0 1h-.538l-.853 10.66A2 2 0 0 1 11.115 16h-6.23a2 2 0 0 1-1.994-1.84L2.038 3.5H1.5a.5.5 0 0 1 0-1H5v-1A1.5 1.5 0 0 1 6.5 0h3A1.5 1.5 0 0 1 11 1.5Zm-5 0v1h4v-1a.5.5 0 0 0-.5-.5h-3a.5.5 0 0 0-.5.5ZM4.5 5.029l.5 8.5a.5.5 0 1 0 .998-.06l-.5-8.5a.5.5 0 1 0-.998.06Zm6.53-.528a.5.5 0 0 0-.528.47l-.5 8.5a.5.5 0 0 0 .998.058l.5-8.5a.5.5 0 0 0-.47-.528ZM8 4.5a.5.5 0 0 0-.5.5v8.5a.5.5 0 0 0 1 0V5a.5.5 0 0 0-.5-.5Z"/>
                </svg>
            </button>
        </li>
    `);

    ul.prepend(li)
    $('[data-toggle="tooltip"]').tooltip();
    
    let buttonDelete = $(li).find('button');
    $(buttonDelete).on("click", function() {
        DB.delete(url, function() {
            li.remove();
            $(".bs-tooltip-top").removeClass('show');
        })
    })
}

watch();

}


// $(".link").attr('disabled', true);
// $(".text").on("paste drop", function() {
//     let text = $(this).val();

// })

if (!indexedDB) {
$(".btn-save").remove();
applicationStart(null);
} else {
const request = indexedDB.open("EasyEnglishVoiceDownload", 1);
request.onerror = function (event) {
    $(".btn-save").remove();
};

request.onupgradeneeded = function () {        
    db = request.result;
    //2
    const store = db.createObjectStore("sentences", { keyPath: "url" });
    //3
    store.createIndex("sentences_url", ["url"], { unique: true });
};

request.onsuccess = function () {
    const db = request.result;        
    applicationStart(db)
};
}

if ( localStorage.getItem("CookieAccept")) {
    $('footer').remove();
}

$(".cookieBarConsentButton").on("click", function() {
    localStorage.setItem("CookieAccept", true);
    $('footer').remove();
})