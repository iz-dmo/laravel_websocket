<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Document</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    @vite('resources/js/app.js')
    <script>
        var sender_id = @json(auth()->user()->id);
        var receiver_id ;
    </script>
</head>
<style>
    body{
        margin: 0px;
        padding: 0px;
        background: #74ebd5;
        background: -webkit-linear-gradient(to right, #ACB6E5, #74ebd5); 
        background: linear-gradient(to right, #ACB6E5, #74ebd5); 
    }
    .pointer{
        cursor: pointer;
    }
    .img-width{
        width : 50px;
        height : 50px;
    }
    #chat-container{
        background-color : white;
        width : 100%;
        height : 400px;
        overflow-y : scroll;
    }
    .border{
        width : 92%;
        padding : 5px;
        margin-top : 3px;
        border-radius : 7px;
    }
    .input-btn {
        padding :5px;
        border-radius : 7px;
        width : 7%;
    }
    .border:focus{
        outline : none !important;
        color : black;
    }
    .offline-status {
        color : red;
    }
    .online-status {
        color: green;
    }
    .current-user-chat{
        color : skyblue;
        font-size : 15px;
    }
    .distance-user-chat{
        color : #74b72e;
        font-size : 15px;
    }
    #message{
        border : 2px solid #ACB6E5 !important;
    }
    .current-user-chat .message-span, .distance-user-chat .message-span{
        padding-left : 3px;
        font-weight : bold;
    }
    .form-control:focus{
        outline : none;
        border : none;
    }
</style>
<body>
    <div class="container mt-3">
        <div class="row">
            @if(count($users) > 0)
                <div class="col-md-3">
                    <ul class="list-group m-0 p-0">
                        @foreach ($users as $user)
                        <li class="list-group-item pointer user-list" data-id="{{ $user->id }}">
                            {{$user->name}}
                            <b><sup id="{{$user->id}}-status" class="offline-status text-end">Offline</sup></b>
                            <form action="" class="request-form">
                                <button id="{{$user->id}}-remove-btn"  class="btn btn-primary request-btn" type="submit">Request</button>
                            </form>
                        </li>
                        @endforeach
                    </ul>
                </div>
                <div class="col-md-9">
                    <h4 class="text-center title-click">Click to start chat👆🏼</h4>
                    <div class="chat-section">

                        <div id="chat-container">

                        </div>

                        <form action="" id="chat-form">
                            <div class="d-flex">
                                <input type="text" name="message" id="message" placeholder="Enter Message" required class="border form-control">
                                <button type="submit" class="btn btn-primary" id="send-btn">Send</button>

                            </div>
                        </form>
                    </div>

                </div>
            @else
                <div class="col-12">
                    <h3 class="text-center">User Not Found!</h3>

                </div>
            @endif

        </div>
        <!-- delete modal -->
        <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered w-25">
                <form action="" id="delete-form">
                    <div class="modal-content">
                        <h6 class="text-center py-3 px-3" id="exampleModalLabel">Are you sure to delete this message?</h6>
                        <input type="hidden" name="id" id="delete-chat-id">
                        <div class="text-center">
                            <h1 class="text-danger"><i class="fa-solid fa-trash"></i></h1>
                            <p class="text-center" id="delete-message"></p>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-danger">Delete</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>

        <!-- update modal -->
        <div class="modal fade" id="editModal" tabindex="-1" aria-labelledby="editModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered w-25">
                <form action="" id="edit-form">
                    <div class="modal-content">
                        <h6 class="text-center py-3 px-3" id="editModalLabel">Are you sure to Edit this message?</h6>
                        <input type="hidden" name="id" id="edit-chat-id">
                        <div class="px-3 mb-3">
                            <input type="text" name="message" id="edit-message" class="form-control" require placeholder="Enter Message">
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="submit" class="btn btn-dark">Update</button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    </div>

    

    
    <!-- script -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js" integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM" crossorigin="anonymous"></script>
    <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.7.1/jquery.min.js"></script>

</body>
</html>
