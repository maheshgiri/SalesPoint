//Global Vars
var PAGE_OUT_POSITION = {TOP:'top', BOTTOM:'bottom'};

var CurrentSession;
var SearchIntervalID;

$(document).ready(Init);

//Process
function Init()
{
    data.initialize();
    AddListeners();
    OpenPage('#page-startup', PAGE_OUT_POSITION.BOTTOM);
    startup.startTesting();
    $(".helper-images > div:gt(0)").hide();
//    setInterval(function() { 
//      $('.helper-images > div:first')
//        .fadeOut(3000)
//        .next()
//        .fadeIn(3000)
//        .end()
//        .appendTo('.helper-images');
//    },  3000);
}
function Reinit()
{
    CurrentSession = new Session();
    CurrentSession.currency = '$';
    scanner.scanning = true;
    swiper.scanning = false;
    scale.active = false;
    
    $('.receipt').empty();
    $('.total .amount').html('$0.00');
    
    $('#page-checkout #pay-now').removeClass('active');
}

function AddListeners()
{
    scanner.addTrigger('.page-current');
    swiper.addTrigger('.page-current');
    
    $('#page-startup .start').click(function() {
        startup.stopTesting();
        ReturnMainMenu_ClickHandler()
    });
    
    $('#page-initial .start-button.english').click(Initial_StartEnglish_ClickHandler);
    $('#page-initial .start-button.spanish').click(Initial_StartSpanish_ClickHandler);
    $('#page-initial').on(scanner.EVENT, Initial_ScannerHandler);
    $('#page-initial').on('beforeopen', Initial_BeforeOpenHandler);
    $('#page-initial').on('afterclose', Initial_AfterCloseHandler);
    
    $('#page-checkout').on('beforeopen', Checkout_BeforeOpenHandler);
    $('#page-checkout').on('afterclose', Checkout_AfterCloseHandler);
    $('#page-checkout').on(scanner.EVENT, Checkout_ScannerHandler);
    $('#page-checkout #lookup-item').click(Checkout_LookupItem_ClickHandler);
    $('#page-checkout #large-item').click(Checkout_LargeItem_ClickHandler);
    $('#page-checkout #type-in-sku').click(Checkout_TypeInSKU_ClickHandler);
    $('#page-checkout #pay-now').click(Checkout_PayNow_ClickHandler);
    $('#overlay-type-in-sku').on('afteropen', TypeInSKU_AfterOpenHandler);
    
    $('#page-lookup').on('beforeopen', Lookup_BeforeOpenHandler);
    $('#page-lookup').on('afteropen', Lookup_AfterOpenHandler);
    $('#page-lookup').on('beforesearch', Lookup_BeforeSearchHandler);
    $('#page-lookup').on('aftersearch', Lookup_AfterSearchHandler);
    $('#page-lookup #item-search-query').keyup(Lookup_ItemSearchQuery_KeyUpHandler);
    
    $('#page-payment-options .payment-method.invalid').click(PaymentOptions_Cash_ClickHandler);
    $('#page-payment-options .payment-method.card').click(PaymentOptions_Card_ClickHandler);
    
    $('#page-payment').on('beforeopen', Payment_BeforeOpenHandler);
    $('#page-payment').on('afterclose', Payment_AfterCloseHandler);
    $('#page-payment').on(swiper.EVENT, Payment_CardReaderHandler);
    
    $('#page-complete').on('afteropen', Complete_AfterOpenHandler);
    $('#page-complete').on('beforeopen', Complete_BeforeOpenHandler);
    $('#page-complete').on('afterclose', Complete_AfterCloseHandler);
    
    $('.return-checkout').click(ReturnCheckout_ClickHandler);
    $('.return-main-menu').unbind('click').click(ReturnMainMenu_ClickHandler);
    $('.call-attendant').unbind('click').click(CallAttendent_ClickHandler);
    $('.return-payment-methods').click(InvalidPaymentType_ReturnPaymentMethods_ClickHandler);
    
    $('#overlay-error .continue').click(Error_Continue_ClickHandler);
    $('#overlay-large-item').click(LargeItem_Cancel_ClickHandler);
    $('#overlay-large-item').on(scanner.EVENT, LargeItem_Cancel_ClickHandler);
    $('#overlay-large-item .cancel').click(LargeItem_Cancel_ClickHandler);
    $('#overlay-type-in-sku .cancel').click(TypeInSKU_Cancel_ClickHandler);
    $('#overlay-type-in-sku .continue').click(TypeInSKU_Continue_ClickHandler);
    $('#overlay-call-attendant .continue').click(CallAttendent_Continue_ClickHandler);
    
    $('#overlay-scale .cancel').click(Scale_Cancel_ClickHandler);
    scale.addEventListener(scale.Event.ADDED, Scale_ItemAdded);
    scale.addEventListener(scale.Event.REMOVED, Scale_ItemRemoved);
}

//Event Handlers
var scale = {};
scale.active = false;

function Initial_StartEnglish_ClickHandler(e)
{ 
    $.getJSON('_locales/en/messages.json', SetLanguage);
    OpenPage('#page-checkout', PAGE_OUT_POSITION.BOTTOM);
}
function Initial_StartSpanish_ClickHandler(e)
{
    $.getJSON('_locales/es/messages.json', SetLanguage);
    OpenPage('#page-checkout', PAGE_OUT_POSITION.BOTTOM);
}
function Initial_ScannerHandler(e, sku) 
{
    Initial_StartEnglish_ClickHandler(e);
    AddItemToReceipt(sku);
}
function Initial_BeforeOpenHandler(e)
{
    document.getElementById('background-video').play();
}
function Initial_AfterCloseHandler(e)
{
    document.getElementById('background-video').pause();
}
function Checkout_BeforeOpenHandler(e) 
{
    scanner.scanning = true;
}
function Checkout_AfterCloseHandler(e) 
{
    scanner.scanning = false;
}
function Checkout_ScannerHandler(e, sku) 
{
    LargeItem_Cancel_ClickHandler();
    AddItemToReceipt(sku);
}
function Checkout_LookupItem_ClickHandler(e)
{
    OpenPage('#page-lookup', PAGE_OUT_POSITION.BOTTOM);
}
function Checkout_LargeItem_ClickHandler(e)
{
    OpenOverlay('overlay-large-item', $('#page-checkout'));
}
function Checkout_TypeInSKU_ClickHandler(e)
{
    scanner.scanning = false;
    $('#overlay-type-in-sku #sku-query').val('');
    OpenOverlay('overlay-type-in-sku', $('#page-checkout'));
}
function Checkout_PayNow_ClickHandler(e)
{
    OpenPage('#page-payment-options', PAGE_OUT_POSITION.BOTTOM);
}
function TypeInSKU_AfterOpenHandler(e) 
{
    //Focus/Click events on input do not bring up the onscreen keyboard
    //Instead, we are adding a placeholder "Touch to Type" message
}
function Lookup_BeforeOpenHandler(e)
{
    ProductSearch();
}
function Lookup_AfterOpenHandler(e)
{
    //Focus/Click events on input do not bring up the onscreen keyboard
    //Instead, we are adding a placeholder "Touch to Type" message
}
function Lookup_BeforeSearchHandler(e)
{
    if($('#page-lookup .search-results .search-result').length > 0)
    {
        $('#page-lookup .search-results .search-result').addClass('search-result-animation-out');
        setTimeout(function()
        {
            $('#page-lookup .search-results').empty();
            $('#modules .loading-animation').clone().appendTo('#page-lookup .search-results');
        }, 1000);
    }
    else
    {
        $('#page-lookup .search-results').empty();
        $('#modules .loading-animation').clone().appendTo('#page-lookup .search-results');
    }
}
function Lookup_AfterSearchHandler(e)
{
    $('#page-lookup .search-results .loading-animation').remove();
    $('#page-lookup .search-results .search-result').addClass('search-result-animation-in');
    setTimeout(function()
    {
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-in');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-1');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-2');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-3');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-4');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-5');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-6');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-7');
        $('#page-lookup .search-results .search-result').removeClass('search-result-animation-8');
    }, 1000);
}
function Lookup_SearchItem_ClickHandler(e)
{
    var sku = $('.title .sku', $(this)).html();    

    OpenPage('#page-checkout', PAGE_OUT_POSITION.BOTTOM);
    $('#page-lookup #item-search-query').val('');
    
    AddItemToReceipt(sku);
}
function Lookup_ItemSearchQuery_KeyUpHandler(e)
{
    var i = 0;
    clearInterval(SearchIntervalID);
    SearchIntervalID = setInterval(function(){UpdateProgress_SearchTimer(i);i++;}, 1);
}
function PaymentOptions_Card_ClickHandler(e)
{
    OpenPage('#page-payment', PAGE_OUT_POSITION.BOTTOM);
}
function PaymentOptions_Cash_ClickHandler(e)
{
    OpenPage('#page-invalid-payment-type', PAGE_OUT_POSITION.BOTTOM);
}
function InvalidPaymentType_ReturnPaymentMethods_ClickHandler(e)
{
    OpenPage('#page-payment-options', PAGE_OUT_POSITION.BOTTOM);
}
function Payment_BeforeOpenHandler(e) 
{
    swiper.scanning = true;
}
function Payment_AfterCloseHandler(e) 
{
    swiper.scanning = false;
}
function Payment_CardReaderHandler(e, card)
{
    var amount = FormatDecimalFromCurrency($('#page-payment .receipt-total .amount').html());
    stripe.chargeCard(card, amount, function(response) {
        if (response.success) {
            OpenPage('#page-complete', PAGE_OUT_POSITION.BOTTOM);
        }
        else {
            ShowError('There was a problem accepting your card: ' + response.message);
        }
    });
}
function Complete_AfterOpenHandler(e)
{
    setTimeout(function()
    {
       ReturnMainMenu_ClickHandler(); 
    }, 3000);
}
function Complete_BeforeOpenHandler(e)
{
    document.getElementById('complete-video').play();
}
function Complete_AfterCloseHandler(e)
{
    document.getElementById('complete-video').pause();
}

function ReturnMainMenu_ClickHandler(e)
{
    Reinit();
    OpenPage('#page-initial', PAGE_OUT_POSITION.BOTTOM);
}
function ReturnCheckout_ClickHandler(e)
{
    OpenPage('#page-checkout', PAGE_OUT_POSITION.BOTTOM);
}
function CallAttendent_ClickHandler(e)
{
    OpenOverlay('overlay-call-attendant', $('.page-current'));
}

function Error_Continue_ClickHandler(e) 
{
     CloseOverlay($('#overlay-large-item'), $('.page-current'));
}
function LargeItem_Cancel_ClickHandler(e)
{
    CloseOverlay($('#overlay-large-item'), $('#page-checkout'));
}
function TypeInSKU_Cancel_ClickHandler(e)
{
    scanner.scanning = true;
    CloseOverlay($('#overlay-type-in-sku'), $('#page-checkout')); 
}
function TypeInSKU_Continue_ClickHandler(e)
{
    scanner.scanning = true;
    var sku = $('#overlay-type-in-sku #sku-query').val();
    CloseOverlay($('#overlay-type-in-sku'), $('#page-checkout')); 
    AddItemToReceipt(sku);
}
function CallAttendent_Continue_ClickHandler(e)
{
    CloseOverlay($('#overlay-call-attendant'), $('.page-current'));
}
function Scale_Cancel_ClickHandler(e)
{
    scale.active = false;
    CloseOverlay($('#overlay-scale'), $('#page-checkout'));
}
function Scale_ItemAdded() {
    $('#overlay-scale .message').hide();
    $('#overlay-scale .wait').show();
}
function Scale_ItemRemoved() {
    $('#overlay-scale .wait').hide();  
    $('#overlay-scale .message').show();
}

//Actions
function ShowError(message) {
    $('#overlay-error .error').html(message);
    OpenOverlay('overlay-error', $('.page-current'));
}
function ProductSearch(query)
{
    $('#page-lookup').trigger('beforesearch');
    if(query == undefined)
    {
        //mock delay for loading animation
        setTimeout(function()
        {
            for(var i=0; i<data.productArray.length; i++)
            {
                var product = data.productArray[i];
                var productElement = $(product.getSearchResult());
                
                if(i < 8)
                {
                    productElement.addClass('search-result-animation-' + (i+1).toString());
                }
                
                productElement.click(Lookup_SearchItem_ClickHandler);
                $('#page-lookup .search-results').append(productElement);
            }
            $('#page-lookup').trigger('aftersearch');
        }, 2000);
    }
    else
    {
        setTimeout(function()
        {
            for(var i=0; i<data.productArray.length; i++)
            {
                var product = data.productArray[i];

                var searchTerm = query.toLowerCase();
                var matchTerm = product.name.toLowerCase();
                if(matchTerm.indexOf(searchTerm) > -1)
                {
                    var productElement = $(product.getSearchResult());

                    if(i < 8)
                    {
                        productElement.addClass('search-result-animation-' + (i+1).toString());
                    }

                    productElement.click(Lookup_SearchItem_ClickHandler);
                    $('#page-lookup .search-results').append(productElement);
                }
            }
            $('#page-lookup').trigger('aftersearch');
        }, 2000);
    }
    
    
}

function AddItemToReceipt(sku)
{
    var product = sku;
    if (typeof sku === 'string') {
        product = data.productsSku[sku];
        if (typeof product === 'undefined') {
            product = data.productsPlu[sku];
        }
    }
    
    if (typeof product === 'undefined') {
        ShowError('Invalid product, please see an attendant for assistance');
        return;
    }
    
    if (product.weightPrice > 0) {
        scale.active = true;
        scanner.scanning = false;
        Scale_ItemRemoved();
        setTimeout(function() {
            //Allow for CSS transitions
            OpenOverlay('overlay-scale', $('#page-checkout'));
        }, 1000);
        
        var attempts = 0;
        var getWeight = function() {
            console.log('scale: ' + scale.active);
            if (!scale.active) {
                return;
            }
            scale.getWeightOunces(function(weight) {
                console.log('got weight: ' + weight.amount);
                if (weight && weight.amount > 0) {
                    var receiptItem = new ReceiptItem(product);
                    receiptItem.weight = weight.amount;

                    CloseOverlay($('#overlay-scale'), $('#page-checkout'));
                    scanner.scanning = true;
                    if (scale.active) {
                        AddItemToReceipt(receiptItem);
                        scale.active = false;
                    }
                }
                else {
                    attempts++;
                    if (attempts < 5) {
                        setTimeout(getWeight, 1000);
                    }
                    else {
                        scale.active = false;
                        scanner.scanning = true;
                        CloseOverlay($('#overlay-scale'), $('#page-checkout'));
                        //Allow for CSS transitions
                        setTimeout(function() {
                            ShowError('An item was not placed on the scale');
                        }, 1000);
                    }
                }
            });
        };
        setTimeout(getWeight, 1000);
    }
    else {
        CurrentSession.receipt.addItem(sku);
        var receipt = $('.receipt-container .receipt');
        receipt.scrollTop(receipt.prop("scrollHeight"));
        $('.receipt-container .receipt-totals .receipt-subtotal .amount').html(FormatCurrency(CurrentSession.receipt.getSubTotal()));
        $('.receipt-container .receipt-totals .receipt-tax .amount').html(FormatCurrency(CurrentSession.receipt.getTaxes()));
        $('.receipt-container .receipt-totals .receipt-total .amount').html(FormatCurrency(CurrentSession.receipt.getGrandTotal()));

        if(CurrentSession.receipt.recieptItems.length > 0)
        {
            $('#page-checkout #pay-now').addClass('active');
        }
        else
        {
            $('#page-checkout #pay-now').removeClass('active');
        }
    }
}

function UpdateProgress_SearchTimer(interval)
{
    if(interval < 200)
    {
        $('#page-lookup #search-timer-progress').val(interval);
    }
    else
    {
        clearInterval(SearchIntervalID);
        $('#page-lookup #search-timer-progress').val(0);
        var searchQuery = $('#page-lookup #item-search-query').val();
        ProductSearch(searchQuery);
    }
}

function OpenPage(pageName, pageOutPosition)
{
    var targetPage = $(pageName);
    if(targetPage.length > 0)
    {
        var animationSpeed = 700;
        
        var currentPage = $('.page-current');
        targetPage.trigger('beforeopen');
        
        //close current page
        $('.page-current').addClass('page-animate-out');
        //after animation, remove erroneous classes
        setTimeout(function()
        {
            currentPage.removeClass('page-current');
            currentPage.removeClass('page-animate-out');
            currentPage.trigger('afterclose');
        }, animationSpeed);
        
        //open new page
        targetPage.addClass('page-current');
        targetPage.addClass('page-animate-in');
        //after animation, remove erroneous classes
        setTimeout(function()
        {
            targetPage.removeClass('page-animate-in');
            targetPage.trigger('afteropen');
        }, animationSpeed);
    }
}

function OpenOverlay(overlayID, page)
{
    $('#' + overlayID).trigger('beforeopen');
    $('.overlay', page).css('display', 'block');
    $('#overlays #' + overlayID).detach().appendTo($('.overlay .foreground .foreground-container', page));
    $('.overlay .foreground .foreground-container', page).addClass('overlay-foreground-animation-in');
    $('.overlay .background', page).addClass('overlay-background-animation-in');
    
    setTimeout(function()
    {        
        $('.overlay .foreground .foreground-container', page).removeClass('overlay-foreground-animation-in');
        $('.overlay .background', page).removeClass('overlay-background-animation-in');
        $('#' + overlayID).trigger('afteropen');
    }, 700);
}
function CloseOverlay(overlayElement, page)
{
    $('.overlay .foreground .foreground-container', page).addClass('overlay-foreground-animation-out');
    $('.overlay .background', page).addClass('overlay-background-animation-out');
    setTimeout(function()
    {
        $('.overlay', page).css('display', 'none');
        overlayElement.detach().appendTo('#overlays');
        
        $('.overlay .foreground .foreground-container', page).removeClass('overlay-foreground-animation-out');
        $('.overlay .background', page).removeClass('overlay-background-animation-out');
    }, 700);   
}

//Helper Functions
function FormatCurrency(value, hideCurrencyType)
{
    var formattedCurrency = '';
    if(hideCurrencyType === true)
    {
        formattedCurrency =  parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    else
    {
        formattedCurrency = CurrentSession.currency + parseFloat(value, 10).toFixed(2).replace(/(\d)(?=(\d{3})+\.)/g, "$1,").toString();
    }
    return formattedCurrency;
}
function FormatDecimalFromCurrency(value)
{
    return parseFloat(value.substr(1));
}

