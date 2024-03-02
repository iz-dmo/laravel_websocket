import './bootstrap';

import Alpine from 'alpinejs';

window.Alpine = Alpine;

Alpine.start();

$(document).ready(function(){
    loadOldRequest();
    $('.chat-section').hide();
    $('.title-click').show();
    // request path
    $('.request-form').on('submit',function(e){
        e.preventDefault();
        var userID = $(this).closest('.user-list').data('id');
        receiver_id = userID;
        var btn_text = $(this).find('.request-btn');
        var isCancel_btn = btn_text.text().trim() === 'Cancel'; 

        if (!isCancel_btn) {
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
                        btn_text.text('Cancel').css('background-color', 'gray');
                        let html = `
                            <input type="hidden" name="id" id="delete_request" data-id="`+response.msg.id+`">                        
                        `;
                        btn_text.closest('.request-form').append(html);
                        } else {
                        alert(response.msg);
                    }
                }
            });
        } 
        // request cancle
        else { 
            var id = $('#delete_request').attr('data-id');
            console.log(id);
            $.ajax({
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                url: "delete-request-messages", 
                type: "POST",
                data: {
                    sender_id : sender_id,
                    receiver_id : receiver_id,
                    id : id,
                },
                success: function(response) {
                    if (response.success) {
                        btn_text.text('Request').css('background-color', '#0275d8'); 
                    } else {
                        alert(response.msg);
                    }
                }
            });
        }

        
    });
    // $('.user-list').on('click',function(){
    //     $('#chat-container').html('');
    //     var userID = $(this).attr('data-id');
    //     receiver_id = userID;
    //     $('.chat-section').show();
    //     $('.title-click').hide();
    //     loadOldChat();
        
    // });

    // chat save
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
        // console.log(id);
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
                // alert(response.data);
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
        // console.log(edit_message);
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
});

// load old data chat
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
                    // console.log(old_request);
                    if(old_request.status == "pending"){
                        if(old_request.sender_id == sender_id){
                            var add_dir = $('.user-list[data-id="' + old_request.receiver_id + '"] .request-form');
                            add_dir.find('button').text("Cancel").css('background-color', 'gray');
                            let html = `
                                <input type="hidden" name="id" id="delete_request" data-id="`+old_request.id+`">                        
                            `;
                            add_dir.append(html);
                        }
                        if (old_request.receiver_id == sender_id) {
                            // console.log('hi');
                            var add_dir_receiver = $('.user-list[data-id="' + old_request.sender_id + '"] .request-form');
                            add_dir_receiver.find($('#' + old_request.sender_id + '-remove-btn')).replaceWith(`
                                <button id="` + old_request.sender_id + `-accept-btn" class="btn btn-success accept-btn" type="submit">Accept</button>
                                <button id="` + old_request.sender_id + `-reject-btn" class="btn btn-danger reject-btn" type="submit">Cancle</button>
                            `);
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
    // console.log(event);
    if(sender_id == event.request_status.receiver_id || receiver_id == event.request_status.sender_id){
        $('#' + event.request_status.sender_id + '-remove-btn').replaceWith(`
            <button id="`+event.request_status.sender_id+`-accept-btn" class="btn btn-success accept-btn" type="submit">Accept</button>
            <button id="`+event.request_status.sender_id+`-reject-btn" class="btn btn-danger reject-btn" type="submit">Cancel</button>
        `);
        loadOldRequest();
    }
    
});

// cancle requeste
Echo.private('request-delete')
.listen('DeleteRequestEvnt',(data) => {
    // console.log(data.id);
    if(sender_id == data.id.receiver_id){
        $('#' + data.id.sender_id + '-accept-btn').remove();
        $('#' + data.id.sender_id + '-reject-btn').remove();
    }
    let requestButtonHtml = `
        <button id="`+data.id.sender_id+`-remove-btn" class="btn btn-primary request-btn" type="submit">Request</button>
    `;
    $('.user-list[data-id="' + data.id.sender_id + '"] .request-form').append(requestButtonHtml); 
});

//old request data

