Imports System.Data.OleDb

Partial Class DataRegister
    Inherits System.Web.UI.Page

    Protected Sub Page_Load(ByVal sender As Object, ByVal e As System.EventArgs) Handles Me.Load
        If Not IsPostBack Then
            LoadDepartmentNames()
        End If
    End Sub

    Protected Sub LoadDepartmentNames()
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"


            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim tablesSchema As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Tables, New Object() {Nothing, Nothing, Nothing, "TABLE"})
                ddlDepartment.Items.Clear()
                ddlDepartment.Items.Add(New ListItem("-- Select Department --", ""))
                For Each row As DataRow In tablesSchema.Rows
                    Dim tableName As String = row("TABLE_NAME").ToString()
                    ddlDepartment.Items.Add(New ListItem(tableName, tableName))
                Next
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Protected Sub LoadSemestersForDepartment(ByVal selectedDepartment As String)
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim query As String = "SELECT DISTINCT SEM FROM [" & selectedDepartment & "]"
                Using command As New OleDbCommand(query, connection)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        ddlSemester.Items.Clear()
                        ddlSemester.Items.Add(New ListItem("-- Select Semester --", ""))
                        While reader.Read()
                            Dim semester As String = reader("SEM").ToString()
                            ddlSemester.Items.Add(New ListItem(semester, semester))
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Protected Sub LoadSubjectsForSemester(ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim query As String = "SELECT SUBNAME, SUBCODE FROM [" & selectedDepartment & "] WHERE SEM = ?"
                Using command As New OleDbCommand(query, connection)
                    command.Parameters.AddWithValue("@Semester", selectedSemester)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        ddlSubjectList.Items.Clear()
                        ddlSubjectList.Items.Add(New ListItem("-- Select Subject --", ""))
                        While reader.Read()
                            Dim subject As String = reader("SUBNAME").ToString()
                            Dim subCode As String = reader("SUBCODE").ToString()
                            ddlSubjectList.Items.Add(New ListItem(subject & " - " & subCode, subject))
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub


    Protected Sub LoadSubjectTypesForSubject(ByVal selectedDepartment As String, ByVal selectedSubject As String)
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim query As String = "SELECT DISTINCT SUBTYPE FROM [" & selectedDepartment & "] WHERE SUBNAME = ?"
                Using command As New OleDbCommand(query, connection)
                    command.Parameters.AddWithValue("@Subject", selectedSubject)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        ddlSubjectType.Items.Clear()
                        ddlSubjectType.Items.Add(New ListItem("-- Select Subject Type --", ""))
                        While reader.Read()
                            Dim subjectType As String = reader("SUBTYPE").ToString()
                            ddlSubjectType.Items.Add(New ListItem(subjectType, subjectType))
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Protected Function LoadCreditsForSubjectType(ByVal selectedDepartment As String, ByVal selectedSubName As String) As String
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim query As String = "SELECT CREDITS FROM [" & selectedDepartment & "] WHERE SUBNAME = ?"
                Using command As New OleDbCommand(query, connection)
                    command.Parameters.AddWithValue("@SubjectName", selectedSubName)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        If reader.Read() Then
                            Return reader("CREDITS").ToString()
                        End If
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try

        Return String.Empty
    End Function
    Protected Sub ddlDepartment_SelectedIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Dim selectedDepartment As String = ddlDepartment.SelectedValue
        LoadSemestersForDepartment(selectedDepartment)
    End Sub

    Protected Sub ddlSemester_SelectedIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Dim selectedDepartment As String = ddlDepartment.SelectedValue
        Dim selectedSemester As String = ddlSemester.SelectedValue
        LoadSubjectsForSemester(selectedDepartment, selectedSemester)
    End Sub

    Protected Sub ddlSubjectList_SelectedIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Dim selectedDepartment As String = ddlDepartment.SelectedValue
        Dim selectedSubject As String = ddlSubjectList.SelectedValue
        txtCredits.Text = LoadCreditsForSubjectType(selectedDepartment, selectedSubject)

        LoadSubjectTypesForSubject(selectedDepartment, selectedSubject)

        Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
    End Sub

    Private Function GetSubCodeForSubject(ByVal selectedDepartment As String, ByVal selectedSubject As String) As String
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()
                Dim query As String = "SELECT SUBCODE FROM [" & selectedDepartment & "] WHERE SUBNAME = ?"
                Using command As New OleDbCommand(query, connection)
                    command.Parameters.AddWithValue("@Subject", selectedSubject)
                    Dim result As Object = command.ExecuteScalar()

                    If result IsNot Nothing AndAlso result IsNot DBNull.Value Then
                        Return result.ToString()
                    End If
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try

        Return String.Empty
    End Function

    Protected Sub ddlSubjectType_SelectedIndexChanged(ByVal sender As Object, ByVal e As EventArgs)
        Dim selectedDepartment As String = ddlDepartment.SelectedValue
        Dim selectedSubjectType As String = ddlSubjectType.SelectedValue
        ' txtCredits.Text = LoadCreditsForSubjectType(selectedDepartment, selectedSubjectType);
    End Sub

    Private Function GetRValues(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal rSubField As String) As Dictionary(Of String, String)
        Dim rValues As New Dictionary(Of String, String)

        Try
            ' Construct the table name based on the selected department and semester
            Dim departmentTableName As String = selectedDepartment
            Dim selectedSemester As String = ddlSemester.SelectedValue
            Dim selectedSubject As String = ddlSubjectList.SelectedValue
            Dim subjectType As String = GetSubjectTypeForSubject(selectedDepartment, selectedSubject)
            Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
            Dim gaSubField As String = "GA" & selectedSemester & "_SUB" & subCode
            Dim eSubField As String = "E" & selectedSemester & "_SUB" & subCode
            Dim iASubField As String = "IA" & selectedSemester & "_SUB" & subCode

            ' Specify the database path and table name for testingSampleQuery
            Dim connectionStringTestingSample As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"

            ' Construct the testingSampleQuery using the specified database path and departmentTableName
            Dim testingSampleQuery As String = ""
            If subjectType = "NC" Then
                testingSampleQuery = "SELECT REG_NO, " & iASubField & " FROM " & departmentTableName
            Else
                testingSampleQuery = "SELECT REG_NO, " & eSubField & " FROM " & departmentTableName
            End If
            ' Use testingSampleQuery inside the Using block
            Using testingSampleConnection As New OleDbConnection(connectionStringTestingSample), _
                  testingSampleCommand As New OleDbCommand(testingSampleQuery, testingSampleConnection)
                testingSampleConnection.Open()
                Using testingSampleReader As OleDbDataReader = testingSampleCommand.ExecuteReader()
                    While testingSampleReader.Read()
                        Dim regNo As String = testingSampleReader("REG_NO").ToString()


                        Dim rValue As String

                        If subjectType = "NC" Then
                            rValue = testingSampleReader(iASubField).ToString()
                        Else
                            rValue = testingSampleReader(eSubField).ToString()
                        End If
                        rValues.Add(regNo, rValue)
                    End While
                End Using
            End Using

            ' Continue using updateQuery or testingSampleQuery if needed outside the Using block
            ' ...

        Catch ex As Exception
            LogException(ex)
        End Try

        ' Return the dictionary of register numbers and R values
        Return rValues
    End Function

    Private Function GetSubjectTypeForSubject(ByVal selectedDepartment As String, ByVal selectedSubject As String) As String
        Dim subjectType As String = ""

        Try
            ' Construct the query to retrieve the subject type
 Dim query As String = "SELECT SUBTYPE FROM " & selectedDepartment & " WHERE SUBNAME = ?"
            ' Use the query inside the Using block
            Using connection As New OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"),
                  command As New OleDbCommand(query, connection)

                command.Parameters.AddWithValue("@Subject", selectedSubject)

                ' Open the connection, execute the query, and read the result
                connection.Open()
                Using reader As OleDbDataReader = command.ExecuteReader()
                    If reader.Read() Then
                        subjectType = reader("SUBTYPE").ToString()
                    End If
                End Using
            End Using

            Return subjectType
        Catch ex As Exception
            LogException(ex)
            Return ""
        End Try
    End Function











    Private Sub UpdateGA1Sub1GradesAndGP1Sub1(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal ga1Sub1Field As String)
        Try
            ' Construct the table name based on the selected department and semester
            Dim departmentTableName As String = selectedDepartment
            Dim selectedSemester As String = ddlSemester.SelectedValue
            Dim selectedSubject As String = ddlSubjectList.SelectedValue
            Dim subjectType As String = GetSubjectTypeForSubject(selectedDepartment, selectedSubject)

            Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
            Dim tSubField As String = "T" & selectedSemester & "_SUB" & subCode
            Dim gpSubfield As String = "GP" & selectedSemester & "_SUB" & subCode
            Dim eSubField As String = "E" & selectedSemester & "_SUB" & subCode
            Dim iASubField As String = "IA" & selectedSemester & "_SUB" & subCode
            Dim gaSubField As String = "GA" & selectedSemester & "_SUB" & subCode
            Dim rSubField As String = "R" & selectedSemester & "_SUB" & subCode
            Dim rValuesDictionary As Dictionary(Of String, String) = GetRValues(connection, selectedDepartment, rSubField)
            Dim subcodeColumnCount As Integer = GetAllSubCodes(connection, selectedDepartment, selectedSemester)

            Dim GaColumns As String = String.Join(", ", Enumerable.Range(1, subcodeColumnCount).Select(Function(i) "GA" & selectedSemester & "_SUB" & i))
            Dim columnsToUpdate As String() = GaColumns.Split(", ") ' Assuming GaColumns is a comma-separated list of column names

            ' Construct the SET clause with parameter placeholders
            Dim setClause As String = String.Join(", ", columnsToUpdate.Select(Function(column) column & " = ?"))
            ' Specify the database path and table name for testingSampleQuery
            Dim connectionStringTestingSample As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"

            ' Construct the testingSampleQuery using the specified database path and departmentTableName
            Dim testingSampleQuery As String = ""
            If subjectType = "NC" Then
                testingSampleQuery = "SELECT REG_NO, " & iASubField & " FROM " & departmentTableName
            Else
                testingSampleQuery = "SELECT REG_NO, " & tSubField & " FROM " & departmentTableName

            End If
            ' Use testingSampleQuery inside the Using block
            Using testingSampleConnection As New OleDbConnection(connectionStringTestingSample),
                  testingSampleCommand As New OleDbCommand(testingSampleQuery, testingSampleConnection)
                testingSampleConnection.Open()
                Using testingSampleReader As OleDbDataReader = testingSampleCommand.ExecuteReader()

                    While testingSampleReader.Read()
                        Dim regNo As String = testingSampleReader("REG_NO").ToString()
                        Dim t1Sub1Value As String = ""
                        If subjectType = "NC" Then
                            t1Sub1Value = Convert.ToString(testingSampleReader(iASubField))
                        Else
                            t1Sub1Value = Convert.ToString(testingSampleReader(tSubField))
                        End If
                        Dim grade As String

                        If t1Sub1Value = "" Then
                            t1Sub1Value = 0
                        End If

                        If rValuesDictionary.ContainsKey(regNo) Then
                            Dim rValue As String = rValuesDictionary(regNo)

                            If subjectType = "NC" Then
                                If t1Sub1Value <> "SA" AndAlso t1Sub1Value <> "NE" AndAlso t1Sub1Value <> "AB" Then
                                    t1Sub1Value *= 2
                                End If

                            End If
                            If rValue = "AB" Then
                                grade = "F"
                                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & gaSubField & " = ?, " & gpSubfield & " = 0  WHERE REG_NO = ?"
                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    updateCommand.Parameters.AddWithValue("@Grade", grade)
                                    updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    updateCommand.ExecuteNonQuery()
                                End Using

                            ElseIf rValue = "NE" Then
                                grade = "F**"
                                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & gaSubField & " = ?, " & gpSubfield & " = 0  WHERE REG_NO = ?"
                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    updateCommand.Parameters.AddWithValue("@Grade", grade)
                                    updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    updateCommand.ExecuteNonQuery()
                                End Using
                            ElseIf rValue = "SA" Then
                                grade = "F*"
                                Dim updateQuery As String = ""
                                If subjectType = "NC" Then
                                    ' Construct the update query to update only the specified column (gaSubField)
                                    updateQuery = "UPDATE " & selectedDepartment & " SET " & gaSubField & " = ?, " & gpSubfield & " = 0  WHERE REG_NO = ?"
                                Else
                                    ' Construct the update query using the setClause to update multiple columns
                                    updateQuery = "UPDATE " & selectedDepartment & " SET " & setClause & " WHERE REG_NO = ?"
                                End If

                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    ' Add parameter for the grade
                                    updateCommand.Parameters.AddWithValue("@Grade", grade)

                                    If subjectType = "NC" Then
                                        ' Add parameter for the REG_NO
                                        updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    Else
                                        ' Add parameters for each column in columnsToUpdate
                                        For Each column In columnsToUpdate
                                            updateCommand.Parameters.AddWithValue("@" & column, grade)
                                        Next
                                        ' Add parameter for the REG_NO
                                        updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    End If

                                    ' Execute the update command
                                    updateCommand.ExecuteNonQuery()
                                End Using

                            Else

                            Else

                                ' Continue with the existing logic for other grades
                                If t1Sub1Value >= 91 Then
                                    grade = "A+"
                                ElseIf t1Sub1Value >= 81 Then
                                    grade = "A"
                                ElseIf t1Sub1Value >= 71 Then
                                    grade = "B+"
                                ElseIf t1Sub1Value >= 61 Then
                                    grade = "B"
                                ElseIf t1Sub1Value >= 51 Then
                                    grade = "C+"
                                ElseIf t1Sub1Value >= 45 Then
                                    grade = "C"
                                ElseIf t1Sub1Value >= 40 Then
                                    grade = "D"

                                Else
                                    grade = "F"
                                End If


                                ' Update the ga1Sub1Field values in the department table based on matching REG_NO
                                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & ga1Sub1Field & " = ? WHERE REG_NO = ?"
                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    updateCommand.Parameters.AddWithValue("@Grade", grade)
                                    updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    updateCommand.ExecuteNonQuery()

                                    ' Update the GP1_SUB1 values based on GA1_SUB1 values
                                    Dim gp1Sub1Points As Integer

                                    Select Case grade
                                        Case "A+"
                                            gp1Sub1Points = 10
                                        Case "A"
                                            gp1Sub1Points = 9
                                        Case "B+"
                                            gp1Sub1Points = 8
                                        Case "B"
                                            gp1Sub1Points = 7
                                        Case "C+"
                                            gp1Sub1Points = 6
                                        Case "C"
                                            gp1Sub1Points = 5
                                        Case "D"
                                            gp1Sub1Points = 4
                                        Case "F**"
                                            gp1Sub1Points = 0
                                        Case "F*"
                                            gp1Sub1Points = 0
                                            'Case Else
                                            '    gp1Sub1Points = 0



                                    End Select


                                    Dim updateGP1Sub1Query As String = "UPDATE " & selectedDepartment & " SET " & gpSubfield & " = ? WHERE REG_NO = ?"
                                    Using updateGP1Sub1Command As New OleDbCommand(updateGP1Sub1Query, connection)
                                        updateGP1Sub1Command.Parameters.AddWithValue("@GP1_SUB1", gp1Sub1Points)
                                        updateGP1Sub1Command.Parameters.AddWithValue("@RegNo", regNo)
                                        updateGP1Sub1Command.ExecuteNonQuery()
                                    End Using
                                End Using
                            End If
                        End If
                    End While

                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub
    Private Function GetAllSubCodes(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String) As Integer
        Dim ceColumnCount As Integer = 0

        Try
            Dim ceColumnPrefix As String = "GA" & selectedSemester & "_SUB"
            Dim tableName As String = selectedDepartment ' Assuming the table name is the same as the department

            Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})

            For Each row As DataRow In schemaTable.Rows
                Dim columnName As String = row("COLUMN_NAME").ToString()
                If columnName.StartsWith(ceColumnPrefix) Then
                    ceColumnCount += 1
                End If
            Next
        Catch ex As Exception
            LogException(ex)
        End Try

        Return ceColumnCount
    End Function


    Private Function GetAllcodesSub(ByVal selectedDepartment As String, ByVal selectedSemester As String) As Integer
        Dim ceColumnCount As Integer = 0

        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"
            Dim ceColumnPrefix As String = "R" & selectedSemester & "_SUB"
            Dim tableName As String = selectedDepartment ' Assuming the table name is the same as the department

            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})

                For Each row As DataRow In schemaTable.Rows
                    Dim columnName As String = row("COLUMN_NAME").ToString()
                    If columnName.StartsWith(ceColumnPrefix) Then
                        ceColumnCount += 1
                    End If
                Next
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try

        Return ceColumnCount
    End Function

    Protected Sub btnSubmit_Click(ByVal sender As Object, ByVal e As EventArgs)
        Try
            Dim selectedDepartment As String = ddlDepartment.SelectedValue
            Dim selectedSemester As String = ddlSemester.SelectedValue
            Dim selectedSubject As String = ddlSubjectList.SelectedValue

            Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
            Dim rSubField As String = "R" & selectedSemester & "_SUB" & subCode
            Dim caSubField As String = "CA" & selectedSemester & "_SUB" & subCode
            Dim gaSubField As String = "GA" & selectedSemester & "_SUB" & subCode
            Dim tcaSubField As String = "TCA" & selectedSemester

            If Not String.IsNullOrEmpty(caSubField) Then
                Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\Users\krishna\OneDrive\Documents\Grade master(3).mdb;Persist Security Info=False;"

                Using connection As New OleDbConnection(connectionString)
                    connection.Open()
                    

                    ' Get the sum of all CA columns
                    Dim sumCA As Integer = GetSumCA(selectedDepartment, selectedSemester, subCode)

                    ' Update the TCA1 column with the sum of CA columns
                    Dim queryUpdateTCA As String = "UPDATE " & selectedDepartment & " SET " & tcaSubField & " = ?"
                    Using updateTCACommand As New OleDbCommand(queryUpdateTCA, connection)
                        updateTCACommand.Parameters.AddWithValue("@" & tcaSubField, sumCA)

                        updateTCACommand.ExecuteNonQuery()
                    End Using

                    Dim r1Sub1DataList As List(Of String) = GetAllR1Sub1Data(selectedDepartment, selectedSemester, subCode)
                    Dim queryCaUpdate As String = "UPDATE " & selectedDepartment & " SET " & caSubField & " = ?"

                    Using caUpdateCommand As New OleDbCommand(queryCaUpdate, connection)
                        caUpdateCommand.Parameters.AddWithValue("@" & caSubField, txtCredits.Text)

                        caUpdateCommand.ExecuteNonQuery()
                    End Using

                    'UpdateRValues(connection, selectedDepartment, rSubField)

                    Dim ceSubFieldValue As String = If(r1Sub1DataList.Any(Function(value) value.ToUpper() = "P"), txtCredits.Text, "0")
                    UpdateCEFieldForAllRecords(connection, selectedDepartment, selectedSemester, subCode, ceSubFieldValue)
                    UpdateTCEColumn(connection, selectedDepartment, selectedSemester)
                    UpdateGA1Sub1GradesAndGP1Sub1(connection, selectedDepartment, gaSubField)
                    UpdateTCPColumn(connection, selectedDepartment, selectedSemester, subCode)
                    UpdateSGPA1Column(connection, selectedDepartment, selectedSemester)
                    UpdateCCE1Column(connection, selectedDepartment, selectedSemester)
                    UpdateCGPAColumn(connection, selectedDepartment, selectedSemester)
                    UpdatePCColumn(connection, selectedDepartment, selectedSemester)
                    UpdateCPEColumn(connection, selectedDepartment, selectedSemester, subCode)
                    UpdateResultColumn(connection, selectedDepartment, selectedSemester)
                    UpdateCE5SubColumn(selectedDepartment)
                    Dim script As String = "showSnackbar('success-snackbar', 'CE updated for all records.');"
                    ClientScript.RegisterStartupScript(Me.GetType(), "SnackbarScript", script, True)
                End Using
            Else
                Dim script As String = "showSnackbar('error-snackbar', 'CA_SUB field not determined.');"
                ClientScript.RegisterStartupScript(Me.GetType(), "SnackbarScript", script, True)
            End If

            ClearForm()
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub
    'Private Function GetColumnNamesAndOrdinalsOfTable(connection As OleDbConnection, tableName As String) As Dictionary(Of String, Integer)
    '    Dim columnNamesAndOrdinals As New Dictionary(Of String, Integer)()

    '    Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})
    '    For Each row As DataRow In schemaTable.Rows
    '        Dim columnName As String = row("COLUMN_NAME").ToString()
    '        Dim ordinalPosition As Integer = Convert.ToInt32(row("ORDINAL_POSITION"))
    '        columnNamesAndOrdinals.Add(columnName, ordinalPosition)
    '    Next

    '    Return columnNamesAndOrdinals
    'End Function

    Private Sub UpdateCE5SubColumn(ByVal selectedDepartment As String)
        Try
            ' Connection to the first database
            Dim connectionString1 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"
            Using connection1 As New OleDbConnection(connectionString1)
                connection1.Open()

                ' Query to fetch data from R5_SUBT and R5_SUBP columns
                Dim queryFetchData As String = "SELECT SLNO, R5_SUBT, R5_SUBP FROM " & selectedDepartment

                Using fetchDataCommand As New OleDbCommand(queryFetchData, connection1)
                    Using reader As OleDbDataReader = fetchDataCommand.ExecuteReader()
                        ' Connection to the second database
                        Dim connectionString2 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\Users\krishna\OneDrive\Documents\Grade master(3).mdb;Persist Security Info=False;"
                        Using connection2 As New OleDbConnection(connectionString2)
                            connection2.Open()

                            ' Query to update CE5_SUB column
                            Dim queryUpdateCE5Sub As String = "UPDATE " & selectedDepartment & " SET CE5_SUB = ? WHERE SINO = ?"

                            Using updateCE5SubCommand As New OleDbCommand(queryUpdateCE5Sub, connection2)
                                While reader.Read()
                                    ' Fetch values from the first database
                                    Dim sino As Integer = Convert.ToInt32(reader("SLNO"))
                                    Dim r5SubT As String = reader("R5_SUBT").ToString()
                                    Dim r5SubP As String = reader("R5_SUBP").ToString()

                                    ' Update CE5_SUB in the second database based on conditions
                                    If r5SubT = "P" AndAlso r5SubP = "P" Then
                                        updateCE5SubCommand.Parameters.Clear()
                                        updateCE5SubCommand.Parameters.AddWithValue("@CE5_SUB", "P")
                                        updateCE5SubCommand.Parameters.AddWithValue("@SINO", sino)
                                        updateCE5SubCommand.ExecuteNonQuery()
                                    Else
                                        updateCE5SubCommand.Parameters.Clear()
                                        updateCE5SubCommand.Parameters.AddWithValue("@CE5_SUB", "F")
                                        updateCE5SubCommand.Parameters.AddWithValue("@SINO", sino)
                                        updateCE5SubCommand.ExecuteNonQuery()
                                    End If
                                End While
                            End Using
                        End Using
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub



    Private Function GetSumCA(ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String) As Integer
        Dim sumCA As Integer = 0
        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\C-21 DICT UPD NOV-2023.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                ' Determine the CA_SUB field based on semester and subject code
                Dim caSubField As String = "CA" & selectedSemester & "_SUB" & subCode

                ' Query to get the sum of all CA columns
                Dim querySumCA As String = "SELECT SUM(CREDITS) AS TotalCA FROM " & selectedDepartment & " WHERE SEM = " & selectedSemester

                Using sumCACommand As New OleDbCommand(querySumCA, connection)
                    Dim result As Object = sumCACommand.ExecuteScalar()
                    If result IsNot Nothing AndAlso result IsNot DBNull.Value Then
                        sumCA = Convert.ToInt32(result)
                    End If
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try

        Return sumCA
    End Function

    Private Function GetAllR1Sub1Data(ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String) As List(Of String)
        Dim r1Sub1DataList As New List(Of String)()
        Dim departmentTableName As String = selectedDepartment

        Try
            ' Specify the database path and table name
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"

            ' Determine the R_SUB field based on semester and subject code
            Dim rSubField As String = "R" & selectedSemester & "_SUB" & subCode

            Dim query As String = "SELECT SLNO, " & rSubField & " FROM [" & departmentTableName & "]" ' Note the square brackets around the table name

            ' Use the provided connection string
            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                Using command As New OleDbCommand(query, connection)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        While reader.Read()
                            Dim rSub1Value As String = If(Not reader.IsDBNull(reader.GetOrdinal(rSubField)), reader(rSubField).ToString(), "")
                            r1Sub1DataList.Add(rSub1Value)
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            ' Log the exception details
            LogException(ex)
        End Try

        Return r1Sub1DataList
    End Function
    Private Function GetAllR1SubData(ByVal selectedDepartment As String, ByVal selectedSemester As String) As Dictionary(Of Integer, List(Of String))
        Dim r1SubDataDictionary As New Dictionary(Of Integer, List(Of String))()
        Dim subcodeColumnCount As Integer = GetAllcodesSub(selectedDepartment, selectedSemester)

        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                For i As Integer = 1 To subcodeColumnCount
                    Dim rSubField As String = "R" & selectedSemester & "_SUB" & i
                    Dim query As String = "SELECT SLNO, " & rSubField & " FROM [" & selectedDepartment & "]"

                    Using command As New OleDbCommand(query, connection)
                        Using reader As OleDbDataReader = command.ExecuteReader()
                            While reader.Read()
                                Dim slno As Integer = reader.GetInt32(reader.GetOrdinal("SLNO"))
                                Dim rSubValue As String = If(Not reader.IsDBNull(reader.GetOrdinal(rSubField)), reader(rSubField).ToString(), "")

                                If Not r1SubDataDictionary.ContainsKey(slno) Then
                                    r1SubDataDictionary.Add(slno, New List(Of String)())
                                End If

                                r1SubDataDictionary(slno).Add(rSubValue)
                            End While
                        End Using
                    End Using
                Next
            End Using
        Catch ex As Exception
            ' Log the exception details
            LogException(ex)
        End Try

        Return r1SubDataDictionary
    End Function





    Private Sub UpdateTCEColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            ' Determine the TCE_SUB field based on semester
            Dim tceSubField As String = "TCE" & selectedSemester

            ' Get the count of CE columns
            Dim ceColumnCount As Integer = GetCEColumnCount(connection, selectedDepartment, selectedSemester)

            ' Construct a dynamic SQL query to select all CE columns for the selected semester
            Dim ceColumns As String = String.Join(", ", Enumerable.Range(1, ceColumnCount).Select(Function(i) "CE" & selectedSemester & "_SUB" & i))
            Dim querySelectCE As String = "SELECT SINO, " & ceColumns & " FROM " & selectedDepartment

            Using selectCECommand As New OleDbCommand(querySelectCE, connection)
                Using reader As OleDbDataReader = selectCECommand.ExecuteReader()
                    While reader.Read()
                        Dim sumCE As Integer = 0

                        ' Iterate through each CE column for the current row and sum the values
                        For i As Integer = 1 To ceColumnCount
                            If reader(i) IsNot DBNull.Value Then
                                sumCE += Convert.ToInt32(reader(i))
                            End If
                        Next

                        ' Update the corresponding TCE column for the current row based on SINO
                        Dim queryUpdateTCE As String = "UPDATE " & selectedDepartment & " SET " & tceSubField & " = ? WHERE SINO = ?"
                        Using updateTCECommand As New OleDbCommand(queryUpdateTCE, connection)
                            updateTCECommand.Parameters.AddWithValue("@" & tceSubField, sumCE)

                            updateTCECommand.Parameters.AddWithValue("@SINO", reader("SINO"))
                            updateTCECommand.ExecuteNonQuery()
                        End Using
                    End While
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub


    Private Sub UpdateTCPColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String)
        Try
            ' Determine the TCP_SUB field based on semester
            Dim tcpSubField As String = "TCPE" & selectedSemester

            ' Get the count of CE and GP columns
            Dim ceColumnCount As Integer = GetCEColumnCount(connection, selectedDepartment, selectedSemester)
            Dim gpColumnCount As Integer = GetGPColumnCount(connection, selectedDepartment, selectedSemester, subCode)

            ' Construct a dynamic SQL query to select all relevant columns for the selected semester
            Dim gpColumns As String = String.Join(", ", Enumerable.Range(1, gpColumnCount).Select(Function(i) "GP" & selectedSemester & "_SUB" & i))
            Dim ceColumns As String = String.Join(", ", Enumerable.Range(1, ceColumnCount).Select(Function(i) "CE" & selectedSemester & "_SUB" & i))
            Dim querySelectData As String = "SELECT SINO, " & gpColumns & ", " & ceColumns & " FROM " & selectedDepartment

            Using selectDataCommand As New OleDbCommand(querySelectData, connection)
                Using reader As OleDbDataReader = selectDataCommand.ExecuteReader()
                    While reader.Read()
                        Dim product As Decimal = 0 ' Initialize product to 0

                        ' Multiply GP{selectedsemester}_SUB{i} and CE{selectedSemester}_SUB{i} for the current row
                        For i As Integer = 1 To gpColumnCount
                            Dim gpValue As Decimal = If(reader.IsDBNull(i), 0, Convert.ToDecimal(reader(i)))
                            Dim ceValue As Decimal = If(reader.IsDBNull(i + gpColumnCount), 0, Convert.ToDecimal(reader(i + gpColumnCount)))
                            product += gpValue * ceValue
                        Next

                        ' Update the corresponding TCP column for the current row based on SINO
                        Dim queryUpdateTCP As String = "UPDATE " & selectedDepartment & " SET " & tcpSubField & " = ? WHERE SINO = ?"
                        Using updateTCPCommand As New OleDbCommand(queryUpdateTCP, connection)
                            updateTCPCommand.Parameters.AddWithValue("@" & tcpSubField, product)
                            updateTCPCommand.Parameters.AddWithValue("@SINO", reader("SINO"))
                            updateTCPCommand.ExecuteNonQuery()
                        End Using
                    End While
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Private Sub UpdateCPEColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String)
        Try
            ' Determine the TCP_SUB field based on semester
            Dim tcpSubField As String = "CP" & selectedSemester & "_SUB" & subCode
            Dim gpColumns As String = "GP" & selectedSemester & "_SUB" & subCode
            Dim ceColumns As String = "CE" & selectedSemester & "_SUB" & subCode

            Dim querySelectData As String = "SELECT SINO, " & gpColumns & ", " & ceColumns & " FROM " & selectedDepartment

            Using selectDataCommand As New OleDbCommand(querySelectData, connection)
                Using reader As OleDbDataReader = selectDataCommand.ExecuteReader()
                    Dim ceValue = 0
                    Dim gpValue = 0
                    While reader.Read()
                        ' Perform addition of GP and CE values

                        If Not reader(gpColumns) Is DBNull.Value Then
                            gpValue = Convert.ToInt32(reader(gpColumns))

                        End If

                        If Not reader(ceColumns) Is DBNull.Value Then
                            ceValue = Convert.ToInt32(reader(ceColumns))
                        
                        End If

                        Dim sumOfGPCE As Integer = gpValue * ceValue

                        ' Update the corresponding TCP column for the current row based on SINO
                        Dim queryUpdateTCP As String = "UPDATE " & selectedDepartment & " SET " & tcpSubField & " = ? WHERE SINO = ?"
                        Using updateTCPCommand As New OleDbCommand(queryUpdateTCP, connection)
                            updateTCPCommand.Parameters.AddWithValue("@" & tcpSubField, sumOfGPCE)
                            updateTCPCommand.Parameters.AddWithValue("@SINO", reader("SINO"))
                            updateTCPCommand.ExecuteNonQuery()
                        End Using
                    End While
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub



    Private Sub UpdateSGPA1Column(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim selectedSubject As String = ddlSubjectList.SelectedValue
            Dim sgpa1SubField As String = "SGPA" & selectedSemester
            Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
            Dim tcpeColumn As String = "TCPE" & selectedSemester
            Dim tceColumn As String = "TCA" & selectedSemester
            Dim r1SubDataDictionary As Dictionary(Of Integer, List(Of String)) = GetAllR1SubData(selectedDepartment, selectedSemester)


            Dim querySelectData As String = "SELECT SINO, " & tcpeColumn & ", " & tceColumn & " FROM " & selectedDepartment

            Using selectDataCommand As New OleDbCommand(querySelectData, connection)
                Using reader As OleDbDataReader = selectDataCommand.ExecuteReader()
                    While reader.Read()
                        Dim tcpeValue As Decimal = If(reader.IsDBNull(1), 0, Convert.ToDecimal(reader(1)))
                        Dim tceValue As Decimal = If(reader.IsDBNull(2), 0, Convert.ToDecimal(reader(2)))

                        ' Avoid division by zero
                        Dim sgpa1Value As Decimal
                        If tceValue <> 0 Then
                            sgpa1Value = Decimal.Round(tcpeValue / tceValue, 2)
                        Else
                            sgpa1Value = 0
                        End If

                        ' If SINO value corresponds to "F" in r1Sub1DataList, set sgpa1Value to 0.00
                        If r1SubDataDictionary.ContainsKey(reader("SINO")) AndAlso r1SubDataDictionary(reader("SINO")).Contains("F") Then
                            sgpa1Value = 0.0
                        End If


                        ' Format sgpa1Value with two decimal places
                        Dim formattedSGPA1Value As String = sgpa1Value.ToString("F2")

                        ' Update the corresponding SGPA1 column for the current row based on SINO
                        Dim queryUpdateSGPA1 As String = "UPDATE " & selectedDepartment & " SET " & sgpa1SubField & " = ? WHERE SINO = ?"
                        Using updateSGPA1Command As New OleDbCommand(queryUpdateSGPA1, connection)
                            updateSGPA1Command.Parameters.AddWithValue("@" & sgpa1SubField, formattedSGPA1Value)
                            updateSGPA1Command.Parameters.AddWithValue("@SINO", reader("SINO"))
                            updateSGPA1Command.ExecuteNonQuery()
                        End Using
                    End While
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub



    Private Sub UpdateCCE1Column(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim cce1SubField As String = "CCE" & selectedSemester
            Dim tceSubFields As String = ""

            ' Build the TCE subfields string based on the selected semester
            For i As Integer = 1 To Convert.ToInt32(selectedSemester)
                tceSubFields &= "Val(TCE" & i & ")"
                If i < Convert.ToInt32(selectedSemester) Then
                    tceSubFields &= " + "
                End If
            Next

            ' Include the sum of TCE fields in the SELECT query grouped by SINO
            Dim querySelectCCE1 As String = "SELECT SINO, sum(" & tceSubFields & ") AS TCE_Sum FROM " & selectedDepartment & " GROUP BY SINO"

            Using selectCCE1Command As New OleDbCommand(querySelectCCE1, connection)
                Using reader As OleDbDataReader = selectCCE1Command.ExecuteReader()
                    While reader.Read()
                        Dim sino As Object = reader("SINO")
                        Dim tceSumValue As Object = reader("TCE_Sum")

                        ' Update CCE1SubField based on SINO
                        Dim queryUpdateCCE1 As String = "UPDATE " & selectedDepartment & " SET " & cce1SubField & " = ? WHERE SINO = ?"

                        Using updateCCE1Command As New OleDbCommand(queryUpdateCCE1, connection)
                            updateCCE1Command.Parameters.AddWithValue("@CCE1Value", tceSumValue)
                            updateCCE1Command.Parameters.AddWithValue("@SINO", sino)
                            updateCCE1Command.ExecuteNonQuery()
                        End Using
                    End While
                End Using
            End Using

        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

Private Sub UpdateCGPAColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim sgpaSubField As String = "SGPA" & selectedSemester
            Dim cgpaSubField As String = "CGPA" & selectedSemester
            Dim tcpeSubFields As String = ""
            Dim tceSubFields As String = ""

            ' Build the TCPE and CCE subfields string based on the selected semester
            For i As Integer = 1 To Convert.ToInt32(selectedSemester)
                tcpeSubFields &= "Val(TCPE" & i & ")"
                'cceSubFields &= "Val(CCE" & i & ")"
                tceSubFields &= "Val(TCE" & i & ")"
                If i < Convert.ToInt32(selectedSemester) Then
                    tcpeSubFields &= " + "
                    tceSubFields &= " + "
                End If
            Next

            ' Include the sum of TCPE and CCE fields in the SELECT query grouped by SINO
            Dim querySelectCGPA As String = "SELECT SINO, sum(" & tcpeSubFields & ") AS TCPE_Sum, sum(" & tceSubFields & ") AS TCE_Sum FROM " & selectedDepartment & " GROUP BY SINO"

            Using selectCGPACommand As New OleDbCommand(querySelectCGPA, connection)
                Using reader As OleDbDataReader = selectCGPACommand.ExecuteReader()
                    While reader.Read()
                        Dim sino As Object = reader("SINO")
                        Dim tcpeSumValue As Object = reader("TCPE_Sum")
                        'Dim cceSumValue As Object = reader("CCE_Sum")
                        Dim tceSumValue As Object = reader("TCE_Sum")
                        Dim sgpaSubFieldValue = ""
                        Dim selectQuery As String = "SELECT " & sgpaSubField & " FROM " & selectedDepartment & " WHERE SINO = ?"
                        Using command As New OleDbCommand(selectQuery, connection)
                            command.Parameters.AddWithValue("@SINO", sino)
                            sgpaSubFieldValue = command.ExecuteScalar()


                        End Using
                        If selectedSemester = "1" Then
                            Dim queryCopySGPAToCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = " & sgpaSubField & " WHERE SINO = ?"
                          
                            Dim cgpa_Value As Double = Convert.ToDouble(Math.Round(If(Not IsDBNull(sgpaSubFieldValue), Convert.ToDouble(sgpaSubFieldValue), 0.0) / Convert.ToDouble(tceSumValue), 2))

                            If Double.IsNaN(cgpa_Value) OrElse cgpa_Value <= 0 Then
                                Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = 'Credit(s) Pending' WHERE SINO = ?"

                                Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                    updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                    updateCGPACommand.ExecuteNonQuery()
                                End Using
                            Else
                                Using copySGPAToCGPACommand As New OleDbCommand(queryCopySGPAToCGPA, connection)
                                    copySGPAToCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                    copySGPAToCGPACommand.ExecuteNonQuery()
                                End Using
                            End If


                        ElseIf Not IsDBNull(tceSumValue) AndAlso Convert.ToDouble(tceSumValue) <> 0.0 Then
                            ' Calculate CGPA based on TCPE and CCE
                            Dim cgpaValue As Double = Math.Round(If(Not IsDBNull(sgpaSubFieldValue), Convert.ToDouble(sgpaSubFieldValue), 0.0) / Convert.ToDouble(tceSumValue), 2)

                            If cgpaValue <= 0 Then
                                ' If CGPA value is less than or equal to 0, set CGPA value to "Credit(s) Updated"
                                Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = 'Credit(s) Pending' WHERE SINO = ?"

                                Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                    updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                    updateCGPACommand.ExecuteNonQuery()
                                End Using
                            Else
                                ' Otherwise, update CGPA value normally
                                Dim formattedCGPAValue As String = cgpaValue.ToString("F2")
                                Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = ? WHERE SINO = ?"

                                Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                    updateCGPACommand.Parameters.AddWithValue("@CGPAValue", formattedCGPAValue)
                                    updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                    updateCGPACommand.ExecuteNonQuery()
                                End Using
                            End If
                        Else
                            ' If TCE_Sum is zero or empty, set CGPA value to "Credit(s) Updated"
                            Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = 'Credit(s) Pending' WHERE SINO = ?"

                            Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                updateCGPACommand.ExecuteNonQuery()
                            End Using
                        End If

                    End While
                End Using
            End Using

        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub



    Private Sub UpdatePCColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim pcSubField As String = "PC" & selectedSemester
            Dim cgpaSubField As String = "CGPA" & selectedSemester

            ' Include the CGPA selected semester column in the SELECT query
            Dim querySelectPC As String = "SELECT SINO, " & cgpaSubField & " FROM " & selectedDepartment

            Using selectPCCommand As New OleDbCommand(querySelectPC, connection)
                Using reader As OleDbDataReader = selectPCCommand.ExecuteReader()
                    While reader.Read()
                        Dim sino As Object = reader("SINO")
                        Dim cgpaValue As Object = reader(cgpaSubField)

                        ' Check if CGPA is not empty and not "Credits(s) Pending" to avoid issues
                        If Not IsDBNull(cgpaValue) AndAlso cgpaValue.ToString() <> "Credit(s) Pending" Then
                            ' Calculate PC based on the formula
                            Dim pcValue As Double = (Convert.ToDouble(cgpaValue) - 0.75) * 10

                            ' Check if PC value is less than or equal to 0
                            If pcValue <= 0 Then
                                ' If PC value is less than or equal to 0, set PC value to "Not Applicable"
                                Dim queryUpdatePC As String = "UPDATE " & selectedDepartment & " SET " & pcSubField & " = 'Not Applicable' WHERE SINO = ?"

                                Using updatePCCommand As New OleDbCommand(queryUpdatePC, connection)
                                    updatePCCommand.Parameters.AddWithValue("@SINO", sino)
                                    updatePCCommand.ExecuteNonQuery()
                                End Using
                            Else
                                ' Format the PC value to two decimal places
                                Dim formattedPCValue As String = pcValue.ToString("0.00")

                                ' Update the PC column based on the calculated value
                                Dim queryUpdatePC As String = "UPDATE " & selectedDepartment & " SET " & pcSubField & " = ? WHERE SINO = ?"

                                Using updatePCCommand As New OleDbCommand(queryUpdatePC, connection)
                                    updatePCCommand.Parameters.AddWithValue("@PCValue", formattedPCValue)
                                    updatePCCommand.Parameters.AddWithValue("@SINO", sino)
                                    updatePCCommand.ExecuteNonQuery()
                                End Using
                            End If
                        Else
                            ' Set PC value to "Not Applicable" if CGPA is "Credits(s) Pending"
                            Dim queryUpdatePC As String = "UPDATE " & selectedDepartment & " SET " & pcSubField & " = 'Not Applicable' WHERE SINO = ?"

                            Using updatePCCommand As New OleDbCommand(queryUpdatePC, connection)
                                updatePCCommand.Parameters.AddWithValue("@SINO", sino)
                                updatePCCommand.ExecuteNonQuery()
                            End Using
                        End If
                    End While
                End Using
            End Using

        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub





    Private Function GetSumOfTCEForSINO(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal sino As Integer) As Decimal
        Dim tceColumnCount As Integer = GetTCEColumnCount(connection, selectedDepartment, selectedSemester)

        ' Construct a dynamic SQL query to select the sum of CE columns for a specific SINO
        Dim tceColumn As String = String.Join(" + ", Enumerable.Range(1, tceColumnCount).Select(Function(i) "TCE" & i))
        Dim querySelectTCE As String = "SELECT SUM(" & tceColumn & ") FROM " & selectedDepartment & " WHERE SINO = ?"

        Using selectTCECommand As New OleDbCommand(querySelectTCE, connection)
            selectTCECommand.Parameters.AddWithValue("@SINO", sino)

            Dim result As Object = selectTCECommand.ExecuteScalar()

            If result IsNot Nothing AndAlso result IsNot DBNull.Value Then
                Return Convert.ToDecimal(result)
            Else
                Return 0
            End If
        End Using
    End Function
    Private Sub UpdateResultColumn(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String)
        Try
            Dim pcSubField As String = "PC" & selectedSemester
            Dim resultSubField As String = "Result" & selectedSemester

            ' Include the PC selected semester column in the SELECT query
            Dim querySelectPC As String = "SELECT SINO, " & pcSubField & " FROM " & selectedDepartment

            Using selectPCCommand As New OleDbCommand(querySelectPC, connection)
                Using reader As OleDbDataReader = selectPCCommand.ExecuteReader()
                    While reader.Read()
                        Dim sino As Object = reader("SINO")
                        Dim pcValue As Object = reader(pcSubField)

                        If Not IsDBNull(pcValue) AndAlso pcValue.ToString() <> "Not Applicable" Then
                            Dim pcNumericValue As Double = Convert.ToDouble(pcValue)

                            If pcNumericValue >= 70 Then
                                ' Update result to "Distinction"
                                UpdateResult(connection, selectedDepartment, resultSubField, sino, "Distinction")
                            ElseIf pcNumericValue >= 60 AndAlso pcNumericValue < 70 Then
                                ' Update result to "First Class"
                                UpdateResult(connection, selectedDepartment, resultSubField, sino, "First Class")
                            ElseIf pcNumericValue >= 40 AndAlso pcNumericValue < 60 Then
                                ' Update result to "Second Class"
                                UpdateResult(connection, selectedDepartment, resultSubField, sino, "Second Class")
                            Else
                                ' Update result to "Failed"
                                UpdateResult(connection, selectedDepartment, resultSubField, sino, "FAILS")
                            End If
                        Else
                            ' Update result to "Failed" if PC is "Not Applicable"
                            UpdateResult(connection, selectedDepartment, resultSubField, sino, "FAILS")
                        End If
                    End While
                End Using
            End Using

        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Private Sub UpdateResult(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal resultSubField As String, ByVal sino As Object, ByVal resultValue As String)
        Dim queryUpdateResult As String = "UPDATE " & selectedDepartment & " SET " & resultSubField & " = ? WHERE SINO = ?"

        Using updateResultCommand As New OleDbCommand(queryUpdateResult, connection)
            updateResultCommand.Parameters.AddWithValue("@ResultValue", resultValue)
            updateResultCommand.Parameters.AddWithValue("@SINO", sino)
            updateResultCommand.ExecuteNonQuery()
        End Using
    End Sub




    Private Function GetTCEColumnCount(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String) As Integer
        Dim tceColumnCount As Integer = 0

        Try
            Dim tceColumnPrefix As String = "TCE"
            Dim tableName As String = selectedDepartment ' Assuming the table name is the same as the department

            Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})

            For Each row As DataRow In schemaTable.Rows
                Dim columnName As String = row("COLUMN_NAME").ToString()
                If columnName.StartsWith(tceColumnPrefix) Then
                    tceColumnCount += 1
                End If
            Next
        Catch ex As Exception
            LogException(ex)
        End Try

        Return tceColumnCount
    End Function

    Private Function GetCEColumnCount(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String) As Integer
        Dim ceColumnCount As Integer = 0

        Try
            Dim ceColumnPrefix As String = "CE" & selectedSemester & "_SUB"
            Dim tableName As String = selectedDepartment ' Assuming the table name is the same as the department

            Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})

            For Each row As DataRow In schemaTable.Rows
                Dim columnName As String = row("COLUMN_NAME").ToString()
                If columnName.StartsWith(ceColumnPrefix) Then
                    ceColumnCount += 1
                End If
            Next
        Catch ex As Exception
            LogException(ex)
        End Try

        Return ceColumnCount
    End Function

    Private Function GetGPColumnCount(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String) As Integer
        Dim gpColumnCount As Integer = 0

        Try
            Dim gpColumnPrefix As String = "GP" & selectedSemester '& "_SUB" & subCode
            Dim tableName As String = selectedDepartment ' Assuming the table name is the same as the department

            Dim schemaTable As DataTable = connection.GetOleDbSchemaTable(OleDbSchemaGuid.Columns, New Object() {Nothing, Nothing, tableName, Nothing})

            For Each row As DataRow In schemaTable.Rows
                Dim columnName As String = row("COLUMN_NAME").ToString()
                If columnName.StartsWith(gpColumnPrefix) Then
                    gpColumnCount += 1
                End If
            Next
        Catch ex As Exception
            LogException(ex)
        End Try

        Return gpColumnCount
    End Function

    Private Sub UpdateCEFieldForAllRecords(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String, ByVal ceSubFieldValue As String)
        Try
            ' Assuming the condition is related to a specific field named "SomeField"
            Dim conditionField As String = "R" & selectedSemester & "_SUB" & subCode
            Dim otherConnectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\proj1\master_res_db.mdb"

            ' Check the condition using a SELECT query for all SLNO and the conditionField
            Dim checkConditionQuery As String = "SELECT SLNO, " & conditionField & " FROM " & selectedDepartment & " WHERE " & conditionField & " = 'P' OR " & conditionField & " = 'F' OR " & conditionField & " = 'F*' OR " & conditionField & " = 'F**'"

            Using checkConditionConnection As New OleDbConnection(otherConnectionString)
                checkConditionConnection.Open()

                Using checkConditionCommand As New OleDbCommand(checkConditionQuery, checkConditionConnection)
                    Using reader As OleDbDataReader = checkConditionCommand.ExecuteReader()
                        ' Loop through all records with SLNO where the condition is met
                        While reader.Read()
                            Dim slnoValue As Integer = Convert.ToInt32(reader("SLNO"))
                            Dim conditionValue As String = reader(conditionField).ToString()

                            ' Establish connection to the other database
                            Using otherConnection As New OleDbConnection(otherConnectionString)
                                otherConnection.Open()

                                ' Update records in the other database based on the result of the SELECT query
                                Dim ceSubField As String = "CE" & selectedSemester & "_SUB" & subCode
                                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & ceSubField & " = ? WHERE SINO = ?"

                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    ' Use the conditionValue in the update
                                    If conditionValue = "P" Then
                                        updateCommand.Parameters.AddWithValue("@" & ceSubField, ceSubFieldValue)
                                    ElseIf conditionValue = "F" Then
                                        updateCommand.Parameters.AddWithValue("@" & ceSubField, 0)
                                    ElseIf conditionValue = "F*" Then
                                        updateCommand.Parameters.AddWithValue("@" & ceSubField, 0)
                                    ElseIf conditionValue = "F**" Then
                                        updateCommand.Parameters.AddWithValue("@" & ceSubField, 0)
                                    End If
                                    updateCommand.Parameters.AddWithValue("@SINO", slnoValue)
                                    updateCommand.ExecuteNonQuery()
                                End Using
                            End Using
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub


    Private Function GetNextSino(ByVal connection As OleDbConnection) As Integer
        Try
            Dim query As String = "SELECT MAX(SINO) FROM info"

            Using command As New OleDbCommand(query, connection)
                Dim result As Object = command.ExecuteScalar()

                If result IsNot Nothing AndAlso result IsNot DBNull.Value Then
                    Return Convert.ToInt32(result) + 1
                Else
                    Return 1
                End If
            End Using
        Catch ex As Exception
            ' Log and handle exceptions
            LogException(ex)
            Return 0
        End Try
    End Function

    'Private Sub LogException(ByVal ex As Exception)
    'Console.WriteLine($"Exception: {ex.Message}{vbCrLf}StackTrace: {ex.StackTrace}")
    'End Sub


    Private Sub ClearForm()
        ddlDepartment.SelectedIndex = 0
        ddlSemester.SelectedIndex = 0
        ddlSubjectList.SelectedIndex = 0
        ddlSubjectType.SelectedIndex = 0
        'txtRegisterNumber.Text = ""
        txtCredits.Text = ""

        LoadDepartmentNames()
    End Sub

    Private Sub LogException(ByVal ex As Exception)
        ' Implement your exception logging logic here
    End Sub


    ' Add other event handlers as needed
End Class
