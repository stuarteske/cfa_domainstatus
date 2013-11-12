var DomainLookup = {
    properties: {
        ajaxUrlIpLookup: 'http://localhost/api/api_iplookup/iplookup.php',
        ajaxUrlLatencyLookup: 'http://localhost/api/api_ping/ping.php',
        timeout: 10000,
        logOutput: true,
        domainNameClass: '.domain-name',
        ipClass: '.ip',
        latencyClass: '.latency',
        statusClass: '.status'
    },

    /**
     * init
     * @description ...
     */
    init: function(){
        this.consoleOutput('INIT');

        DomainLookup.lookupDomainIpAddressesFromDomainNameArray();
        DomainLookup.lookupLatenciesFromDomainNameArray();
    },

    /**
     * getDomainListArray
     * @description ...
     * @return domainNameArray (array)
     */
    getDomainListArray: function() {
        // Define default value
        classString = this.properties.domainNameClass;

        // Init empty array
        var domainNameArray = [];

        // Loop over the results
        $(classString).each(function(){
            // Store the results in the array
            domainNameArray.push(
                $(this).html()
            );
        })

        // Return the array
        return domainNameArray;
    },

    /**
     * getDomainIpAddressesFromDomainNameArray
     * @description ...
     * @param domainNameArray (array)
     */
    lookupDomainIpAddressesFromDomainNameArray: function(domainNameArray) {
        // Define default value
        if (_.isEmpty(domainNameArray)) domainNameArray = DomainLookup.getDomainListArray();

        $.ajax({
            url: DomainLookup.properties.ajaxUrlIpLookup,
            type: 'get',
            cache:false,
            dataType:"json",
            data: {'domains' : domainNameArray},
            timeout: DomainLookup.properties.timeout,
            success: function(data, textStatus, jqXHR) {

                // Verify response data
                if (data == "") {
                    // Data error fail the connection
                    DomainLookup.consoleOutput("Connection Timed out.");
                } else {
                    // Data is valid
                    DomainLookup.updateInterfaceIps(data);
                }
            },
            error:function(jqXHR, textStatus, errorThrown) {
                DomainLookup.consoleOutput("Connection " + errorThrown);
            }
        });
    },

    /**
     * updateInterfaceIps
     * @description ...
     * @param jsonData (string)
     */
    updateInterfaceIps: function(jsonData) {
        // Define default values
        var classString = this.properties.domainNameClass;

        var outputIp = '-';

        // Loop over the results
        $(classString).each(function(){
            // Update the ip value
            if ( jsonData[$(this).html()].ip === $(this).html() ) outputIp = '-';
                else outputIp = jsonData[$(this).html()].ip

            $(this).parent().children(DomainLookup.properties.ipClass).html(
                outputIp
            );
        })
    },

    /**
     * getLatenciesFromDomainNameArray
     * @description ...
     * @param domainNameArray (array)
     */
    lookupLatenciesFromDomainNameArray: function(domainNameArray) {
        // Define default value
        if (_.isEmpty(domainNameArray)) domainNameArray = DomainLookup.getDomainListArray();

        $.ajax({
            url: DomainLookup.properties.ajaxUrlLatencyLookup,
            type: 'get',
            cache:false,
            dataType:"json",
            data: {'domains' : domainNameArray},
            timeout: DomainLookup.properties.timeout,
            success: function(data, textStatus, jqXHR) {

                // Verify response data
                if (data == "") {
                    // Data error fail the connection
                    DomainLookup.consoleOutput("Connection Timed out.");
                } else {
                    // Data is valid
                    DomainLookup.updateInterfaceLatencies(data);
                    DomainLookup.updateInterfaceStatuses(data);

                }
            },
            error:function(jqXHR, textStatus, errorThrown) {
                DomainLookup.consoleOutput("Connection " + errorThrown);
            }
        });
    },

    /**
     * updateInterfaceLatencies
     * @description ...
     * @param jsonData (string)
     */
    updateInterfaceLatencies: function(jsonData) {
        // Define default values
        var classString = this.properties.domainNameClass;

        var outputLatency = '-';

        // Loop over the results
        $(classString).each(function(){
            // Update the latency value
            if (jsonData[$(this).html()].latency < 0) outputLatency = '-';
                else outputLatency = jsonData[$(this).html()].latency;

            $(this).parent().children(DomainLookup.properties.latencyClass).html(
                outputLatency
            );
        })
    },

    /**
     * updateInterfaceStatuses
     * @description ...
     * @param jsonData (string)
     */
    updateInterfaceStatuses: function(jsonData) {
        // Define default values
        var classString = this.properties.domainNameClass;

        var statusString = '';
        var labelClass = '';

        // Loop over the results
        $(classString).each(function(){

            if (jsonData[$(this).html()].latency < 0) {
                statusString = 'Offline';
                labelClass = 'label-inverse';
            }
            if ( (jsonData[$(this).html()].latency >= 0) && (jsonData[$(this).html()].latency < 50) ) {
                statusString = 'Good';
                labelClass = 'label-success';
            }
            if ( (jsonData[$(this).html()].latency >= 50) && ((jsonData[$(this).html()].latency <= 200)) ) {
                statusString = 'Ok';
                labelClass = 'label-warning';
            }
            if ( (jsonData[$(this).html()].latency >= 201) ) {
                statusString = 'Bad';
                labelClass = 'label-important';
            }

            // Update the status value
            $(this).parent().children(DomainLookup.properties.statusClass).html(
                '<span class="label ' + labelClass + '">' + statusString + '</span>'
            );
        })
    },

    /**
     * getLogOutput
     * @description ...
     * @return logOutput (boolean)
     */
    getLogOutput: function(){
        return this.properties.logOutput;
    },

    /**
     * consoleOutput
     * @description class function to output a string to
     * the console depending on the debug logOutput value.
     * @param aString (string)
     */
    consoleOutput: function(aString) {
        if (this.getLogOutput()) {
            console.log('DomainLookup: ' + aString);
        }
    }
};

$(document).ready(function(){
    DomainLookup.init();


//    var l1;
//
//    setInterval(function() {
//        l1.refresh(getRandomInt(0, 500));
//    }, 2500);
//
//    var l1 = new JustGage({
//        id: "latency-monitor",
//        value: getRandomInt(0, 500),
//        min: 0,
//        max: 500,
//        title: " ",
//        label: "ms",
//        levelColorsGradient: false
//    });
});