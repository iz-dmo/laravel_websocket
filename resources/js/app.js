import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

$(document).ready(function(){
    loadOldRequest();
    loadOldChat();
    $('.chat-section').hide();
    $('.title-click').show();
    $('.user-list').on('click',function(){
        // $('#chat-container').html('');
        var userID = $(this).attr('data-id');
        receiver_id = userID;
    });

    // chat_message save
    $('#chat-form').submit(function(e){
        e.preventDefault();
        // $('#send-btn').prop('disabled', true);
        var data_message = $('#message').val();
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "chat-messages",
            type : "POST",
            data : {
                sender_id : sender_id,
                receiver_id : receiver_id,
                message : data_message
            },
            success : function(response){
                if(response.success){
                    $('#message').val('');
                    let chat = response.data.message;
                    let html = `
                        <div class="current-user-chat m-3 text-end" id="`+response.data.id+`">
                            <div class="dropdown ms-auto d-inline text-secondary" style="cursor:pointer;">
                                <i class="fas fa-ellipsis-vertical" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                <ul class="dropdown-menu">
                                <li>
                                    <span class="dropdown-item" data-bs-toggle="modal" data-id="`+response.data.id+`" data-message="`+response.data.message+`" data-bs-target="#editModal" style="cursor:pointer;">
                                        <i class="fas fa-pen mx-2"></i> Update
                                    </span>
                                </li>
                                <li>
                                    <span class="dropdown-item text-danger" data-id="`+response.data.id+`" data-bs-toggle="modal" data-bs-target="#exampleModal" style="cursor:pointer;">
                                        <i class="fas fa-trash mx-2"></i> Delete
                                    </span>
                                </li>
                                </ul>
                            </div>
                            <span class="message-span">`+chat+`</span>
                        </div>
                    `;
                    $('#chat-container').append(html);
                    ScrollChat();
                }else{
                    alert(response.msg);
                }
            },

        });        
    });

    // delete modal path
    $(document).on('click','.delete-span',function(){
        var id = $(this).attr('data-id');
        $('#delete-chat-id').val(id);
    });
    $('#delete-form').on('submit',function(e){
        e.preventDefault();
        var id = $('#delete-chat-id').val();
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "delete-messages",
            type : "POST",
            data : { 
                id : id ,
            },
            success : function(response){
                if(response.success){
                    $('#'+id+'-chat').remove();
                    $('#exampleModal').modal('hide');
                }else{
                    alert(response.data);
                }
            }
        });
    });

    // edit modal path
    $(document).on('click','.edit-span',function(){
        $('#edit-chat-id').val($(this).attr('data-id'));
        $('#edit-message').val($(this).attr('data-message'));
    });
    $('#edit-form').on('submit',function(e){
        e.preventDefault();
        var edit_id = $('#edit-chat-id').val();
        var edit_message = $('#edit-message').val();
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "edit-messages",
            type : "POST",
            data : {
                id : edit_id,
                message : edit_message,
            },
            success : function(response){
                if(response.success){
                    $('#'+edit_id+'-chat').find('.message-span').text(edit_message);
                    $('#'+edit_id+'-chat').find('.edit-span').attr('data-message',edit_message);
                    $('#editModal').modal('hide');

                }else{
                    alert(response.msg);
                }
            }


        });
    })

    //------------------------- --- Request Path ------ -----------------------//

    // request pending data 
    $('.request-form').on('submit',function(e){
        e.preventDefault();
        var btn_text = $(this).find('.request-btn');
        var isCancel_btn = btn_text.text().trim() === 'Cancel'; 

        if (btn_text.text() ==  'Request') {
            btn_text.prop('disabled', true);
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                url: "request-messages",
                type: "POST",
                data: {
                    sender_id: sender_id,
                    receiver_id: receiver_id,
                    status: 'pending',                
                },
                success: function(response) {
                    if (response.success) {
                        btn_text.text('Cancel').css('background-color','gray');
                        let html = `
                            <input type="hidden" name="id" id="delete_request" data-id="`+response.msg.id+`">                        
                        `;
                        btn_text.closest('.request-form').append(html);
                        btn_text.prop('disabled', true);
                    } else {
                        alert(response.msg);
                    }
                },
                complete: function() {
                    btn_text.prop('disabled', false);
                }
            });
        }
        if(isCancel_btn){
            var get_id = $(this).find('#delete_request').data('id');
            $(this).find('.reject-btn').prop('disabled', true);
            $.ajax({
                headers : {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                url : "delete-request-messages",
                type : "POST",
                data : {
                    id : get_id,
                    sender_id : sender_id,
                    receiver_id : receiver_id,
                },
                success : function(response){
                    if(response.success){
                        $('#' + response.data.receiver_id + '-remove-btn').remove();
                        let requestHtml = `
                            <button id="`+response.data.receiver_id+`-remove-btn" class="btn btn-primary request-btn" type="submit">Request</button>
                        `;
                        $('.user-list[data-id="' + response.data.receiver_id + '"] .request-form').append(requestHtml);
                        $('#' + response.data.receiver_id + '-accept-btn').remove();
                        $('#' + response.data.receiver_id + '-reject-btn').remove();
                    }                
                },
                complete: function() {
                    $(this).find('.reject-btn').prop('disabled', false);
                }

            });
        }
       

        
    });

    // delete request 
    $(document).on('submit', '.reject-form', function(e) {
        e.preventDefault();
        var get_id = $(this).find('#reject_request').data('id');
        $(this).find('.reject-btn').prop('disabled', true);
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "delete-request-messages",
            type : "POST",
            data : {
                id : get_id,
                sender_id : sender_id,
                receiver_id : receiver_id,
            },
            success : function(response){
                if(response.success){
                    // console.log(response);
                    $('#' + response.data.receiver_id + '-remove-btn').remove();
                    let requestHtml = `
                        <button id="`+response.data.receiver_id+`-remove-btn" class="btn btn-primary request-btn" type="submit">Request</button>
                    `;
                    $('.user-list[data-id="' + response.data.receiver_id + '"] .request-form').append(requestHtml);
                    $('#' + response.data.receiver_id + '-accept-btn').remove();
                    $('#' + response.data.receiver_id + '-reject-btn').remove();
                }                
            },
            complete: function() {
                $(this).find('.reject-btn').prop('disabled', false);
            }

        });
        
    });

    // accept request
    $(document).on('submit', '.accept-form', function(e) {
        e.preventDefault();
        var id = $(this).find('#accept_request').data('id');
        $(this).find('.accept-btn').prop('disabled',true);
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "update-request-messages",
            type : "POST",
            data : {
                sender_id : sender_id,
                receiver_id : receiver_id,
                status : "accept",
                id : id ,
            },
            success : function(response){
                if(response.success){
                    console.log(response.data);
                    $('#'+response.data.receiver_id+'-reject-btn').remove();
                    $('#'+response.data.receiver_id+'-accept-btn').remove();
                    let html = `
                        <small class="text-secondary">Say Hi 👋</small>
                    `;
                    $('.user-list[data-id="' + response.data.receiver_id + '"] .request-form').append(html);
                    $('.user-list[data-id="' + response.data.receiver_id + '"]').on('click',function(){
                        $('#chat-container').html('');
                        $('.chat-section').show();
                        $('.title-click').hide();
                        loadOldChat();
                    })
                    
                }
            }
        });
        
    });

    // delete conversation
    $(document).on('submit','.delete-chat-form',function(e){
        e.preventDefault();
        $.ajax({
            headers : {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
            },
            url : "delete-conversations",
            type : "POST",
            data : {
                sender_id : sender_id,
                receiver_id : receiver_id,
            },
            success : function(response){
                if(response.success){
                    loadOldChat();
                }else{
                    alert(response.error)
                }
            }
        });
        
    });
    
});

// load old data chat_message
function loadOldChat(){
    $.ajax({
        headers : {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        url : "load-messages",
        type : "GET",
        data : {
            sender_id : sender_id,
            receiver_id : receiver_id
        },
        success : function(response){
            if(response.success){
                let chats = response.data;
                let html = '';
                for (let x = 0; x < chats.length; x++) {
                    let addCss = '';
                    if(chats[x].sender_id == sender_id){
                        addCss = 'current-user-chat m-3 text-end';
                    }else{
                        addCss = "distance-user-chat m-3 text-left"
                    }
                    if(chats[x].sender_id == sender_id){
                        html += `
                            <div class="`+addCss+`" id="`+chats[x].id+`-chat">
                                <div class="dropdown ms-auto d-inline text-secondary fw-lighter" style="cursor:pointer;font-size:12px;">
                                    <i class="fa-solid fa-ellipsis-vertical" data-bs-toggle="dropdown" aria-expanded="false"></i>
                                    <ul class="dropdown-menu">
                                        <li>
                                            <span class="dropdown-item edit-span"  data-id="`+chats[x].id+`" data-message="`+chats[x].message+`" data-bs-toggle="modal" data-bs-target="#editModal" style="cursor:pointer;">
                                            <i class="fas fa-pen mx-2"></i> Update
                                            </span>
                                        </li>
                                        <li>
                                            <span class="dropdown-item text-danger delete-span" data-id="`+chats[x].id+`" data-bs-toggle="modal" data-bs-target="#exampleModal" style="cursor:pointer;">
                                                <i class="fas fa-trash mx-2"></i> Delete
                                            </span>
                                        </li>
                                    </ul>
                                </div>
                                <span class="message-span">`+chats[x].message+`</span>
                            </div>
                        `; 
                    }else{
                        html += `
                        <div class="`+addCss+`" id="`+chats[x].id+`-chat">
                            <span class="message-span">`+chats[x].message+`</span>
                        </div>
                        `
                    }
                }
                $('#chat-container').append(html);
                ScrollChat();

            }else{
                alert(response.msg);
            }
        }
    });
}

// load old request data 
function loadOldRequest(){
    $.ajax({
        headers : {
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
        url : "request-old-messages",
        type : "GET",
        success : function(response){
            if(response.success){
                response.data.forEach(function(old_request) {
                    if(old_request.status == "pending"){
                        if(old_request.sender_id == sender_id){
                            var add_dir = $('.user-list[data-id="' + old_request.receiver_id + '"] .request-form');
                            add_dir.find('button').text("Cancel").css('background-color', 'gray');
                            let html = `
                                <input type="hidden" name="id" id="delete_request" data-id="`+old_request.id+`">                        
                            `;
                            add_dir.append(html);
                        }
                        if (old_request.receiver_id == sender_id ) {
                            var add_dir_receiver = $('.user-list[data-id="' + old_request.sender_id + '"] .request-form');
                            add_dir_receiver.find($('#' + old_request.sender_id + '-remove-btn')).remove();
                            var acceptForm = $('<form>');
                            acceptForm.addClass('accept-form');

                            var acceptHiddenInput = $('<input>');
                            acceptHiddenInput.attr('type', 'hidden');
                            acceptHiddenInput.attr('name', 'id');
                            acceptHiddenInput.attr('data-id', old_request.id);
                            acceptHiddenInput.attr('id','accept_request');
                            acceptForm.append(acceptHiddenInput);

                            var acceptButton = $('<button>');
                            acceptButton.attr('id', old_request.sender_id + '-accept-btn');
                            acceptButton.addClass('btn btn-success accept-btn');
                            acceptButton.attr('type', 'submit');
                            acceptButton.text('Accept');
                            acceptForm.append(acceptButton);

                            $('.user-list[data-id="' + old_request.sender_id + '"]').append(acceptForm);

                            var rejectForm = $('<form>');
                            rejectForm.addClass('reject-form');

                            var rejectHiddenInput = $('<input>');
                            rejectHiddenInput.attr('type', 'hidden');
                            rejectHiddenInput.attr('name', 'id');
                            rejectHiddenInput.attr('data-id', old_request.id);
                            rejectHiddenInput.attr('id','reject_request')
                            rejectForm.append(rejectHiddenInput);

                            var rejectButton = $('<button>');
                            rejectButton.attr('id', old_request.sender_id + '-reject-btn');
                            rejectButton.addClass('btn btn-danger reject-btn');
                            rejectButton.attr('type', 'submit');
                            rejectButton.text('Cancel');
                            rejectForm.append(rejectButton);

                            $('.user-list[data-id="' + old_request.sender_id + '"]').append(rejectForm);

                            
                        }
                    }
                    // accept status and start message function 
                    if(old_request.status == 'accept'){
                        if(old_request.sender_id == sender_id){
                            var add_dir = $('.user-list[data-id="' + old_request.receiver_id + '"] .request-form');
                            add_dir.find('button').remove();
                            let html = `
                                <small class="text-secondary">Say Hi 👋</small>
                            `;
                            var add_dir_delete = $('.user-list[data-id="' + old_request.receiver_id + '"]');
                            var delete_chat = $('<form>');
                            delete_chat.addClass('delete-chat-form');

                            var deleteHiddenInput = $('<input>');
                            deleteHiddenInput.attr('type', 'hidden');
                            deleteHiddenInput.attr('name', 'id');
                            deleteHiddenInput.attr('data-id', old_request.receiver_id);
                            deleteHiddenInput.attr('id', 'delete_chat');
                            delete_chat.append(deleteHiddenInput);

                            var deleteButton = $('<button>');
                            deleteButton.attr('id', old_request.sender_id + '-delete-conversation-btn');
                            deleteButton.addClass('btn btn-danger btn-sm delete-conversation-btn');
                            deleteButton.attr('type', 'submit');
                            deleteButton.text('Delete Conversation');
                            delete_chat.append(deleteButton);

                            add_dir_delete.append(delete_chat);
                            add_dir.append(html);
                            $('.user-list[data-id="' + old_request.receiver_id + '"]').on('click',function(){
                                $('#chat-container').html('');
                                $('.chat-section').show();
                                $('.title-click').hide();
                                loadOldChat();
                                
                            });
                        }
                        if(old_request.receiver_id == sender_id){
                            let dir_receiver = $('.user-list[data-id="' + old_request.sender_id + '"] .request-form');
                            dir_receiver.find('button').remove();
                            let html = `
                                <small class="text-secondary">Say Hi 👋</small>
                            `;
                            let dir_receiver_delete = $('.user-list[data-id="' + old_request.sender_id + '"]');
                            var delete_chat = $('<form>');
                            delete_chat.addClass('delete-chat-form');

                            var deleteHiddenInput = $('<input>');
                            deleteHiddenInput.attr('type', 'hidden');
                            deleteHiddenInput.attr('name', 'id');
                            deleteHiddenInput.attr('data-id', old_request.receiver_id);
                            deleteHiddenInput.attr('id', 'delete_chat');
                            delete_chat.append(deleteHiddenInput);

                            var deleteButton = $('<button>');
                            deleteButton.attr('id', old_request.sender_id + '-delete-conversation-btn');
                            deleteButton.addClass('btn btn-danger btn-sm delete-conversation-btn');
                            deleteButton.attr('type', 'submit');
                            deleteButton.text('Delete Conversation');
                            delete_chat.append(deleteButton);

                            dir_receiver_delete.append(delete_chat);
                            dir_receiver.append(html);
                            $('.user-list[data-id="' + old_request.sender_id + '"]').on('click',function(){
                                $('#chat-container').html('');
                                $('.chat-section').show();
                                $('.title-click').hide();
                                loadOldChat();
                                
                            });
                        }
                    
                    }
                });
            }else{
                alert(response.msg);
            }
        },
    });
}


// scroll chat
function ScrollChat(){
    $('#chat-container').animate({
        scrollTop : $('#chat-container').offset().top + $('#chat-container')[0].scrollHeight
    },0);
}

Echo.join('status-update')
.here((users)=>{
    for (let i = 0; i < users.length; i++) {
        if(sender_id != users[i]['id']){
            $('#'+users[i]['id']+'-status').removeClass('offline-status');
            $('#'+users[i]['id']+'-status').addClass('online-status');
            $('#'+users[i]['id']+'-status').text('online');
        }
    }
})
.joining((user)=>{
    // console.log(user.name+" Joined");
    $('#'+user.id+'-status').removeClass('offline-status');
    $('#'+user.id+'-status').addClass('online-status');
    $('#'+user.id+'-status').text('online');
})
.leaving((user)=>{
    $('#'+user.id+'-status').addClass('offline-status');
    $('#'+user.id+'-status').removeClass('online-status');
    $('#'+user.id+'-status').text('offline');})
.listen('App\\Events\\StatusEvent',(e) => {
    // console.log(e);
})

// old chat data
Echo.private('broadcast-message')
.listen('.getChatMessage',( data )=>{
    if(sender_id == data.chat.receiver_id && receiver_id == data.chat.sender_id){
        let html = `
        <div class="distance-user-chat m-3 text-start" id="`+data.chat.id+`-chat">
            <p>`+data.chat.message+`</p>
        </div>        
        `;
        $('#chat-container').append(html);
        ScrollChat();
    }
});

// delete chat message listen
Echo.private('message-deleted')
.listen('MessageDeleteEvent',( event )=>{
    $('#'+event.id+'-chat').remove();
});

// update chat message
Echo.private('edit-message')
.listen('MessageEditEvent', ( event ) => {
    $('#'+event.data.id+'-chat').find('.message-span').text(event.data.message);
    $('#'+event.data.id+'-chat').find('.edit-span').attr('data-message',event.data.message);
})

// sending request
Echo.private('request-status')
.listen('.getRequestMessage',(event) => {
    if(sender_id == event.request_status.receiver_id){
        $('#' + event.request_status.sender_id + '-remove-btn').remove();
        
        // create accept form and btn
        var acceptForm = $('<form>');
        acceptForm.addClass('accept-form');

        var acceptHiddenInput = $('<input>');
        acceptHiddenInput.attr('type', 'hidden');
        acceptHiddenInput.attr('name', 'id');
        acceptHiddenInput.attr('data-id', event.request_status.id);
        acceptHiddenInput.attr('id','accept_request');
        acceptForm.append(acceptHiddenInput);

        var acceptButton = $('<button>');
        acceptButton.attr('id', event.request_status.sender_id + '-accept-btn');
        acceptButton.addClass('btn btn-success accept-btn');
        acceptButton.attr('type', 'submit');
        acceptButton.text('Accept');
        acceptForm.append(acceptButton);
        $('.user-list[data-id="' + event.request_status.sender_id + '"]').append(acceptForm);

        // create reject form and btn 
        var rejectForm = $('<form>');
        rejectForm.addClass('reject-form');

        var rejectHiddenInput = $('<input>');
        rejectHiddenInput.attr('type', 'hidden');
        rejectHiddenInput.attr('name', 'id');
        rejectHiddenInput.attr('data-id', event.request_status.id);
        rejectHiddenInput.attr('id','reject_request')
        rejectForm.append(rejectHiddenInput);

        var rejectButton = $('<button>');
        rejectButton.attr('id', event.request_status.sender_id + '-reject-btn');
        rejectButton.addClass('btn btn-danger reject-btn');
        rejectButton.attr('type', 'submit');
        rejectButton.text('Cancel');
        rejectForm.append(rejectButton);

        $('.user-list[data-id="' + event.request_status.sender_id + '"]').append(rejectForm);

    }
    // loadOldRequest();
    
});

// cancel request
Echo.private('request-delete')
.listen('DeleteRequestEvent',(data) => {
    if(sender_id == data.id.receiver_id){
        $('#'+ data.id.sender_id+'-remove-btn').remove();
        $('#' + data.id.sender_id + '-accept-btn').remove();
        $('#' + data.id.sender_id + '-reject-btn').remove();
        let requestButtonHtml = `
            <button id="`+data.id.sender_id+`-remove-btn" class="btn btn-primary request-btn" type="submit">Request</button>
        `;
        $('.user-list[data-id="' + data.id.sender_id + '"] .request-form').append(requestButtonHtml);
    }
});

Echo.private('request-accept')
.listen('AcceptStatusEvent',(data) => {
    if(sender_id == data.accept_data.receiver_id){
        $('.user-list[data-id="' + data.accept_data.sender_id + '"] .request-form').find('button').remove();
        let html = `
            <small class="text-secondary">Say Hi 👋</small>
            `;
        var delete_chat = $('<form>');
        delete_chat.addClass('delete-chat-form');

        var deleteHiddenInput = $('<input>');
        deleteHiddenInput.attr('type', 'hidden');
        deleteHiddenInput.attr('name', 'id');
        deleteHiddenInput.attr('data-id', data.accept_data.id);
        deleteHiddenInput.attr('id','delete_chat');
        delete_chat.append(deleteHiddenInput);

        var deleteButton = $('<button>');
        deleteButton.attr('id', data.accept_data.sender_id + '-delete-conversation-btn');
        deleteButton.addClass('btn btn-danger delete-conversation-btn');
        deleteButton.attr('type', 'submit');
        deleteButton.text('Delete Conversation');
        delete_chat.append(deleteButton);

        $('.user-list[data-id="' + data.accept_data.sender_id + '"]').append(delete_chat);
        $('.user-list[data-id="' + data.accept_data.sender_id + '"] .request-form').append(html);
        $('.user-list[data-id="' + data.accept_data.sender_id+'').on('click',function(){
            $('#chat-container').html('');
            $('.chat-section').show();
            $('.title-click').hide();
            loadOldChat();
        })
    }
});
