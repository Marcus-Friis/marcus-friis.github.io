var app = angular.module("appName", ['ngRoute']); // remove 'components' unless it's defined elsewhere

app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider
        .when('/', {
            templateUrl: 'partials/frontpage.html',
            controller: 'frontpageCtrl'
        })
        .when('/sheet', {
            templateUrl: 'partials/sheet.html',
            controller: 'sheetCtrl'
        })
        .otherwise({
            redirectTo: '/'
        });
}]);

app.controller('frontpageCtrl', ['$scope', '$http', function ($scope, $http) {
    $scope.songs = ['sheets/bakadarou.abc', 'sheets/zot.abc'];
    function renderSheet(index, song) {
        console.log(song)
        $http.get(song)
            .then(function (response) {
                var abc = response.data;
                ABCJS.renderAbc(`${index}`, abc);
            }, function (err) {
                console.error("Failed to load ABC file:", err);
                $scope.warningText = "Could not load sheet file: " + (err.status ? err.status + " " + err.statusText : "Unknown error");
            })
    }
    $scope.songs.forEach((song, index) => {
        renderSheet(index, song)
    });
}]);

app.controller('sheetCtrl', ['$scope', '$timeout', '$http', function ($scope, $timeout, $http) {
    $scope.transposeBy = 0;
    $scope.showPlayer = false;
    $scope.warningText = '';

    var abc = null;
    var visualObj = null;
    var createSynth = null;
    var synthControl = null;

    // Load the .abc file
    $http.get('sheets/bakadarou.abc')
        .then(function (response) {
            abc = response.data;
            visualObj = ABCJS.renderAbc("paper", abc);
        }, function (err) {
            console.error("Failed to load ABC file:", err);
            $scope.warningText = "Could not load sheet file: " + (err.status ? err.status + " " + err.statusText : "Unknown error");
        });

    function redraw() {
        if (!abc) {
            console.warn("redraw() called before abc loaded");
            return;
        }

        // use $scope.transposeBy for both visual and MIDI transpose here
        visualObj = ABCJS.renderAbc("paper", abc, {
            visualTranspose: Number($scope.transposeBy) || 0
        });

        if (createSynth && synthControl && visualObj && visualObj[0]) {
            // Use same transpose for audio (you can split visual/audio if you want)
            synthControl.setTune(visualObj[0], true, { midiTranspose: Number($scope.transposeBy) || 0 })
                .then(function () {
                    console.log('Audio successfully loaded (setTune).');
                }).catch(function (error) {
                    console.warn('Audio problem in setTune:', error);
                });
        }
    }

    // Exposed to template: show audio player and initialize audio
    $scope.renderPlayer = function () {
        // toggle the boolean for template visibility
        $scope.showPlayer = true;

        if (!ABCJS.synth || !ABCJS.synth.supportsAudio || !ABCJS.synth.supportsAudio()) {
            // Audio support not available (either browser or ABCJS audio script missing)
            document.querySelector('#audio').innerHTML = 'Audio is not supported in this browser or ABCJS audio scripts are missing.';
            return;
        }

        // Ensure we have a visualObj to initialize synth from; if not, (re)render now
        if (!visualObj && abc) {
            visualObj = ABCJS.renderAbc("paper", abc);
        }
        if (!visualObj || !visualObj[0]) {
            console.warn("No visualObj available to initialize synth.");
            $scope.warningText = "Unable to initialize audio: notation not rendered yet.";
            return;
        }

        createSynth = new ABCJS.synth.CreateSynth();
        synthControl = new ABCJS.synth.SynthController();

        createSynth.init({ visualObj: visualObj[0] })
            .then(function () {
                // after buffer prepared, set tune with current transpose
                redraw();
            })
            .catch(function (err) {
                console.warn("CreateSynth init error:", err);
                $scope.warningText = "Audio initialization failed: " + (err && err.message ? err.message : err);
            });

        // No visual cursor (null)
        var cursorControl = null;
        synthControl.load('#audio', cursorControl, {
            displayRestart: true,
            displayPlay: true,
            displayProgress: true
        });
    };

    // Re-draw whenever transposeBy changes (watch)
    $scope.$watch('transposeBy', function (newVal, oldVal) {
        if (newVal !== oldVal) {
            redraw();
        }
    });
}]);