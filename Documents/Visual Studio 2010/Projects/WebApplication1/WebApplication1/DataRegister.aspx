<%@ Page Title="Data Registration" Language="vb" AutoEventWireup="false"
    CodeBehind="DataRegister.aspx.vb" Inherits="WebApplication1.DataRegister" %>

<!DOCTYPE html>

<html xmlns="http://www.w3.org/1999/xhtml">
<head id="Head1" runat="server">
    <title>Data Registration</title>
    <style type="text/css">
        body {
            text-align: center;
        }

        .container {
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            flex-direction: column;
        }

        table {
            border-collapse: collapse;
            width: 50%;
            margin: 20px;
        }

        th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f2f2f2;
        }

        .dropdown-style {
            width: 100%;
            margin-bottom: 10px;
            /* Add any additional dropdown styles here */
        }

        label {
            margin-right: 10px;
        }

        #snackbar {
            visibility: hidden;
            min-width: 250px;
            margin-left: -125px;
            background-color: #333;
            color: #fff;
            text-align: center;
            border-radius: 2px;
            padding: 16px;
            position: fixed;
            z-index: 1;
            left: 50%;
            bottom: 30px;
            font-size: 17px;
        }

        #snackbar.show {
            visibility: visible;
            -webkit-animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }
        
          .success-snackbar {
            background-color: #4CAF50;
        }

        .error-snackbar {
            background-color: #f44336;
        }

        .warning-snackbar {
            background-color: #ff9800;
        }

        .info-snackbar {
            background-color: #2196F3;
        }

        #snackbar.show {
            display: block;
            animation: fadein 0.5s, fadeout 0.5s 2.5s;
        }

        @-webkit-keyframes fadein {
            from { bottom: 0; opacity: 0; }
            to { bottom: 30px; opacity: 1; }
        }

        @keyframes fadein {
            from { bottom: 0; opacity: 0; }
            to { bottom: 30px; opacity: 1; }
        }

        @-webkit-keyframes fadeout {
            from { bottom: 30px; opacity: 1; }
            to { bottom: 0; opacity: 0; }
        }

        @keyframes fadeout {
            from { bottom: 30px; opacity: 1; }
            to { bottom: 0; opacity: 0; }
        }
    </style>
    <script type="text/javascript">
        function enableSubmitButton() {
            var ddlDepartment = document.getElementById('<%= ddlDepartment.ClientID %>');
            var ddlSemester = document.getElementById('<%= ddlSemester.ClientID %>');
            var ddlSubjectList = document.getElementById('<%= ddlSubjectList.ClientID %>');
            var ddlSubjectType = document.getElementById('<%= ddlSubjectType.ClientID %>');
            var ddlStudentList = document.getElementById('<%= ddlStudentList.ClientID %>');
            var btnSubmit = document.getElementById('<%= btnSubmit.ClientID %>');

            if (ddlDepartment.value !== "" &&
                ddlSemester.value !== "" &&
                ddlSubjectList.value !== "" &&
                ddlSubjectType.value !== "" &&
                ddlStudentList.value !== "") {
                btnSubmit.style.opacity = 1;
                btnSubmit.style.pointerEvents = "auto";
            } else {
                btnSubmit.style.opacity = 0.5;
                btnSubmit.style.pointerEvents = "none";
            }
        }

        document.addEventListener("DOMContentLoaded", enableSubmitButton);

        function showSnackbar() {
            var snackbar = document.getElementById("snackbar");
            snackbar.className = "show";
            setTimeout(function () {
                snackbar.className = snackbar.className.replace("show", "");
            }, 3000);
        }
    </script>
</head>

<body>
    <form id="form1" runat="server">
        <div class="container">
            <table>
                <tr class="dropdown-row">
                    <th>Dropdown Name</th>
                    <th>Dropdown</th>
                </tr>
                <tr>
                    <td>Department</td>
                    <td>
                        <asp:DropDownList ID="ddlDepartment" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlDepartment_SelectedIndexChanged" onchange="enableSubmitButton()" CssClass="dropdown-style">
                            <asp:ListItem Text="-- Select Department --" Value="" />
                        </asp:DropDownList>
                    </td>
                </tr>
                <tr>
                    <td>Semester</td>
                    <td>
                        <asp:DropDownList ID="ddlSemester" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSemester_SelectedIndexChanged" onchange="enableSubmitButton()" CssClass="dropdown-style">
                            <asp:ListItem Text="-- Select Semester --" Value="" />
                        </asp:DropDownList>
                    </td>
                </tr>
                <tr>
                    <td>Subject</td>
                    <td>
                        <asp:DropDownList ID="ddlSubjectList" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSubjectList_SelectedIndexChanged" onchange="enableSubmitButton()" CssClass="dropdown-style">
                            <asp:ListItem Text="-- Select Subject --" Value="" />
                        </asp:DropDownList>
                    </td>
                </tr>
                <tr>
                    <td>Subject Type</td>
                    <td>
                        <asp:DropDownList ID="ddlSubjectType" runat="server" AutoPostBack="True" OnSelectedIndexChanged="ddlSubjectType_SelectedIndexChanged" onchange="enableSubmitButton()" CssClass="dropdown-style">
                            <asp:ListItem Text="-- Select Subject Type --" Value="" />
                        </asp:DropDownList>
                    </td>
                </tr>
                <tr>
                    <td>Student</td>
                    <td>
                        <asp:DropDownList ID="ddlStudentList" runat="server" AutoPostBack="True" onchange="enableSubmitButton()" CssClass="dropdown-style">
                            <asp:ListItem Text="-- Select Student Type --" Value="" />
                            <asp:ListItem Text="Regular" Value="1" />
                            <asp:ListItem Text="ITI" Value="2" />
                            <asp:ListItem Text="PUC" Value="3" />
                        </asp:DropDownList>
                    </td>
                </tr>

                <tr>
                    <td>
                        <label for="txtCredits">Credits:</label>
                        <asp:TextBox ID="txtCredits" runat="server" ReadOnly="true" CssClass="your-textbox-style"></asp:TextBox>
                    </td>
                </tr>
            </table>

            <asp:Button ID="btnSubmit" runat="server" Text="Submit" OnClientClick="showSnackbar()" OnClick="btnSubmit_Click" CssClass="your-button-style" />
            <div id="snackbar" class="top-snackbar success-snackbar">Data submitted successfully!</div>
        </div>
    </form>
</body>
</html>
