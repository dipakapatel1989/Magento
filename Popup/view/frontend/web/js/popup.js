define([
    'jquery',
    'Magento_Ui/js/modal/modal',
    'text!Nakshatra_Popup/template/popup.html',
    'mage/cookies'
], function ($,model, template) {
    'use strict';

    return function (settings){
        const content = settings.content,
            timeout = settings.timeout,
            cookieName = 'nakshatra_popup_offered';

        if ($.mage.cookies.get(cookieName)) {
            return;
        }
        console.log(settings);
        const options = {
            type: 'popup',
            responsive: true,
            autoOpen: true,
            modalClass: 'nakshatra_popup',
            popupTpl: template,
            closed: function(){
                const date = new Date();
                const thirtyDaysInMinutes = 43000;
                date.setTime(date.getTime() + (thirtyDaysInMinutes * 60 * 10000 ));
                $.mage.cookies.set(cookieName, 1 ,{expires:date});
            }
        };

        setTimeout(function () {
            $('<div />').html(content).modal(options);
        },timeout * 1000)

    }

});
