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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"


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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionStringTestingSample As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"

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
            Using connection As New OleDbConnection("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"),
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
        Dim result As Integer = 0
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
            Dim cieminColumn As String = "CIEMIN"
            Dim seeminColumn As String = "SEEMIN"

            Dim eSub5Field1 As String = "E" & selectedSemester & "_SUBT"
            Dim eSub5Field2 As String = "E" & selectedSemester & "_SUBP"

            Dim rValuesDictionary As Dictionary(Of String, String) = GetRValues(connection, selectedDepartment, rSubField)
            Dim subcodeColumnCount As Integer = GetAllSubCodes(connection, selectedDepartment, selectedSemester)

            Dim GaColumns As String = String.Join(", ", Enumerable.Range(1, subcodeColumnCount).Select(Function(i) "GA" & selectedSemester & "_SUB" & i))
            Dim columnsToUpdate As String() = GaColumns.Split(", ") ' Assuming GaColumns is a comma-separated list of column names

            ' Construct the SET clause with parameter placeholders
            Dim setClause As String = String.Join(", ", columnsToUpdate.Select(Function(column) column & " = ?"))
            ' Specify the database path and table name for testingSampleQuery
            Dim ciemin_seemin_connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"
            Dim connectionStringTestingSample As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"

            ' Construct the testingSampleQuery using the specified database path and departmentTableName
            Dim testingSampleQuery As String = ""

            If selectedSemester = 5 Then
                testingSampleQuery = "SELECT REG_NO, " & iASubField & " FROM " & departmentTableName
            Else

                If subjectType = "NC" Then
                    testingSampleQuery = "SELECT REG_NO, " & iASubField & " FROM " & departmentTableName
                Else
                    testingSampleQuery = "SELECT REG_NO, " & tSubField & " FROM " & departmentTableName

                End If
            End If

            Dim cieminValue As Integer
            Using cieminConnection As New OleDbConnection(ciemin_seemin_connectionString)
                cieminConnection.Open()
                Dim cieminQuery As String = "SELECT " & cieminColumn & " FROM " & selectedDepartment & " WHERE SEM = " & selectedSemester & " AND SUBCODE = " & subCode & "" ' Replace TableName with actual table name
                Using cieminCommand As New OleDbCommand(cieminQuery, cieminConnection)
                    cieminValue = Convert.ToInt32(cieminCommand.ExecuteScalar())
                End Using
            End Using

            ' Fetch SEEMIN value
            Dim seeminValue As Integer
            Using seeminConnection As New OleDbConnection(ciemin_seemin_connectionString)
                seeminConnection.Open()
                Dim seeminQuery As String = "SELECT " & seeminColumn & " FROM " & selectedDepartment & " WHERE SEM = " & selectedSemester & " AND SUBCODE = " & subCode & "" ' Replace TableName with actual table name
                Using seeminCommand As New OleDbCommand(seeminQuery, seeminConnection)
                    seeminValue = Convert.ToInt32(seeminCommand.ExecuteScalar())
                End Using
            End Using

            ' Use testingSampleQuery inside the Using block
            Using testingSampleConnection As New OleDbConnection(connectionStringTestingSample),
                  testingSampleCommand As New OleDbCommand(testingSampleQuery, testingSampleConnection)
                testingSampleConnection.Open()
                Using testingSampleReader As OleDbDataReader = testingSampleCommand.ExecuteReader()

                    While testingSampleReader.Read()

                        Dim regNo As String = testingSampleReader("REG_NO").ToString()
                        Dim iaValue As String = 0
                        Dim eValue As String = 0

                        Using ia_e_Connection As New OleDbConnection(connectionStringTestingSample)
                            ia_e_Connection.Open()

                            Dim iaQuery As String = "SELECT " & iASubField & ", " & eSubField & " FROM " & selectedDepartment & " WHERE REG_NO = ?"
                            Using iaCommand As New OleDbCommand(iaQuery, ia_e_Connection)
                                iaCommand.Parameters.AddWithValue("@RegNo", regNo)
                                Using iaReader As OleDbDataReader = iaCommand.ExecuteReader()
                                    If iaReader.Read() Then
                                        iaValue = Convert.ToString(iaReader(iASubField))
                                        eValue = Convert.ToString(iaReader(eSubField))
                                    End If
                                    Dim iaNumericValue As Integer
                                    Dim eNumericValue As Integer

                                    If Integer.TryParse(iaValue, iaNumericValue) AndAlso Integer.TryParse(eValue, eNumericValue) Then
                                        ' Compare IA with CIEMIN and E with SEEMIN
                                        If iaNumericValue >= cieminValue AndAlso eNumericValue >= seeminValue Then
                                            result = 1
                                        Else
                                            result = 0
                                        End If
                                    Else
                                        ' Handle cases where IA or E value is not numeric
                                        ' You may choose to log a warning or handle it differently based on your requirements
                                        result = 0
                                    End If
                                End Using
                            End Using
                        End Using
                        Dim t1Sub1Value As String = ""
                        If selectedSemester = 5 Then
                            t1Sub1Value = Convert.ToString(testingSampleReader(eSub5Field1)) 'eSub5FieldT or eSub5FieldP

                        Else

                            If subjectType = "NC" Then
                                t1Sub1Value = Convert.ToString(testingSampleReader(iASubField))
                                result = 1
                            Else
                                t1Sub1Value = Convert.ToString(testingSampleReader(tSubField))
                            End If
                        End If
                        Dim grade As String

                        'If t1Sub1Value = "" Then
                        '    t1Sub1Value = 0
                        'End If

                        If rValuesDictionary.ContainsKey(regNo) Then
                            Dim rValue As String = rValuesDictionary(regNo)

                            If subjectType = "NC" Then
                                If t1Sub1Value <> "SA" AndAlso t1Sub1Value <> "NE" AndAlso t1Sub1Value <> "AB" AndAlso t1Sub1Value <> "A" AndAlso t1Sub1Value <> "S" AndAlso t1Sub1Value <> "F" AndAlso t1Sub1Value <> "B" Then
                                    t1Sub1Value *= 2
                                End If
                                If t1Sub1Value = "A" Or t1Sub1Value = "S" Or t1Sub1Value = "F" Or t1Sub1Value = "B" Then
                                    result = 0
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
                                Dim updateQuery As String = ""
                                grade = "F*"
                                If subjectType = "NC" Then
                                    ' Construct the update query to update only the specified column (gaSubField)
                                    updateQuery = "UPDATE " & selectedDepartment & " SET " & gaSubField & " = ?, " & gpSubfield & " = 0  WHERE REG_NO = ?"
                                Else
                                    ' Construct the update query using the setClause to update multiple columns
                                    updateQuery = "UPDATE " & selectedDepartment & " SET " & setClause & " WHERE REG_NO = ?"
                                End If

                                Using updateCommand As New OleDbCommand(updateQuery, connection)
                                    For Each column In columnsToUpdate
                                        updateCommand.Parameters.AddWithValue("@" & column, grade) ' Use the appropriate value for the parameter
                                    Next
                                    updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                                    updateCommand.ExecuteNonQuery()
                                End Using
                                Dim updateGP1Sub1Query As String = "UPDATE " & selectedDepartment & " SET " & gpSubfield & " = ? WHERE REG_NO = ?"
                                Using updateGP1Sub1Command As New OleDbCommand(updateGP1Sub1Query, connection)
                                    updateGP1Sub1Command.Parameters.AddWithValue("@GP1_SUB1", 0)
                                    updateGP1Sub1Command.Parameters.AddWithValue("@RegNo", regNo)
                                    updateGP1Sub1Command.ExecuteNonQuery()
                                End Using
                            Else

                                ' Continue with the existing logic for other grades
                                If result = 1 Then

                                    If selectedSemester = 5 Then

                                        Dim cieminValue As Integer
                                        Using cieminConnection As New OleDbConnection(ciemin_seemin_connectionString)
                                            cieminConnection.Open()
                                            Dim cieminQuery As String = "SELECT " & cieminColumn & " FROM " & selectedDepartment & " WHERE SEM = " & selectedSemester & " AND SUBCODE = " & subCode & "" ' Replace TableName with actual table name
                                            Using cieminCommand As New OleDbCommand(cieminQuery, cieminConnection)
                                                cieminValue = Convert.ToInt32(cieminCommand.ExecuteScalar())
                                            End Using
                                        End Using

                                        ' Fetch SEEMIN value
                                        Dim seeminValue As Integer
                                        Using seeminConnection As New OleDbConnection(ciemin_seemin_connectionString)
                                            seeminConnection.Open()
                                            Dim seeminQuery As String = "SELECT " & seeminColumn & " FROM " & selectedDepartment & " WHERE SEM = " & selectedSemester & " AND SUBCODE = " & subCode & "" ' Replace TableName with actual table name
                                            Using seeminCommand As New OleDbCommand(seeminQuery, seeminConnection)
                                                seeminValue = Convert.ToInt32(seeminCommand.ExecuteScalar())
                                            End Using
                                        End Using

                                    End If

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
                                        Case Else
                                            gp1Sub1Points = 0



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

    Private Function GetAllRcolumnCount(ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal connectionString As String) As Integer
        Dim ceColumnCount As Integer = 0

        Try
            'Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
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

    Private Function GetAllcodesSub(ByVal selectedDepartment As String, ByVal selectedSemester As String) As Integer
        Dim ceColumnCount As Integer = 0

        Try
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
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

    Private Sub UpdateIAAndGrades(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String, ByVal selectedSubject As String)
        Try
            'If selectedSemester = 1 AndAlso subCode = 6 Then
            If selectedSubject.IndexOf("Yoga", StringComparison.OrdinalIgnoreCase) >= 0 Then
                ' Construct the IA column name
                Dim iaSubField As String = "IA" & selectedSemester & "_SUB" & subCode

                ' Specify the database path and table name for master_res_db
                Dim connectionStringMasterRes As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
                Dim query As String = "SELECT REG_NO, " & iaSubField & " FROM " & selectedDepartment

                ' Use the master_res_db inside the Using block
                Using masterResConnection As New OleDbConnection(connectionStringMasterRes),
                      masterResCommand As New OleDbCommand(query, masterResConnection)
                    masterResConnection.Open()
                    Using masterResReader As OleDbDataReader = masterResCommand.ExecuteReader()
                        While masterResReader.Read()
                            Dim regNo As String = masterResReader("REG_NO").ToString()
                            Dim iaValue As String = masterResReader(iaSubField).ToString()

                            ' Update CE and GA based on IA value
                            UpdateCEAndGA(connection, selectedDepartment, selectedSemester, subCode, regNo, iaValue)
                            ' Update GP and CP based on IA value
                            UpdateGPAndCP(connection, selectedDepartment, selectedSemester, subCode, regNo, iaValue)
                        End While
                    End Using
                End Using
            End If
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Private Sub UpdateCEAndGA(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String, ByVal regNo As String, ByVal iaValue As String)
        Try
            'If selectedSemester = 1 AndAlso subCode = 6 Then
            Dim ceSubField As String = "CE" & selectedSemester & "_Sub" & subCode
            Dim gaSubField As String = "GA" & selectedSemester & "_Sub" & subCode

            Dim ceValue As Integer = If(iaValue = "F" Or iaValue = "AB", 0, 1)
            Dim gaValue As String = ""

            Select Case iaValue
                Case "S"
                    gaValue = "A+"
                Case "A"
                    gaValue = "B+"
                Case "B"
                    gaValue = "C+"
                Case "F"
                    gaValue = "F"
                Case "AB"
                    gaValue = "F"
            End Select

            Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & ceSubField & " = ?, " & gaSubField & " = ? WHERE REG_NO = ?"

            Using updateCommand As New OleDbCommand(updateQuery, connection)
                updateCommand.Parameters.AddWithValue("@CE", ceValue)
                updateCommand.Parameters.AddWithValue("@GA", gaValue)
                updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                updateCommand.ExecuteNonQuery()
            End Using
            'End If
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub

    Private Sub UpdateGPAndCP(ByVal connection As OleDbConnection, ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal subCode As String, ByVal regNo As String, ByVal iaValue As String)
        Try

            'If selectedSemester = 1 AndAlso subCode = 6 Then
            Dim gpSubfield As String = "GP" & selectedSemester & "_Sub" & subCode
            Dim cpSubfield As String = "CP" & selectedSemester & "_Sub" & subCode

            Dim gpValue As Integer = 0

            Select Case iaValue
                Case "S"
                    gpValue = 10
                Case "A"
                    gpValue = 8
                Case "B"
                    gpValue = 6

                Case "F"
                    gpValue = 0
                Case "AB"
                    gpValue = 0
            End Select

            Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & gpSubfield & " = ?, " & cpSubfield & " = ? WHERE REG_NO = ?"

            Using updateCommand As New OleDbCommand(updateQuery, connection)
                updateCommand.Parameters.AddWithValue("@GP", gpValue)
                updateCommand.Parameters.AddWithValue("@CP", gpValue)
                updateCommand.Parameters.AddWithValue("@RegNo", regNo)
                updateCommand.ExecuteNonQuery()
            End Using
            'End If
        Catch ex As Exception
            LogException(ex)
        End Try
    End Sub


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
                Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Grade master.mdb;Persist Security Info=False;"

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
                    If selectedSemester <> 5 Then

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
                        'UpdateCGPAColumn(connection, selectedDepartment, selectedSemester)
                        UpdatePCColumn(connection, selectedDepartment, selectedSemester)
                        UpdateCPEColumn(connection, selectedDepartment, selectedSemester, subCode)
                        UpdateResultColumn(connection, selectedDepartment, selectedSemester)
                        UpdateIAAndGrades(connection, selectedDepartment, selectedSemester, subCode, selectedSubject)
                        UpdateNoAttColumn(selectedSemester, selectedDepartment)
                    Else
                        UpdateCE5SubColumn(selectedDepartment)
                    End If

                    Dim _backLogData As New BackLogData()
                    _backLogData.ddlDepartment = selectedDepartment
                    _backLogData.ddlSemester = selectedSemester
                    _backLogData.ddlSubjectList = selectedSubject
                    _backLogData.txtCredits = txtCredits.Text
                    _backLogData.Page_Load(sender, e)

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

    'Private Sub UpdateNoAttColumn(ByVal selectedSemester As String, ByVal selectedDepartment As String)
    '    ' Define connection strings for different databases
    '    Dim connectionStringMasterRes As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
    '    Dim connectionStringsAttempts As New List(Of String)()

    '    ' Add connection strings for attempts databases based on selected semester
    '    If selectedSemester = "1" Then
    '        ' Add all databases for semester 1
    '        connectionStringsAttempts.Add("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\21novdb.mdb;Persist Security Info=False;")
    '        connectionStringsAttempts.Add("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\22maydb.mdb;Persist Security Info=False;")
    '        ' Add connections for other semester 1 databases if available
    '        ' connectionStringsAttempts.Add(...)
    '    ElseIf selectedSemester = "2" Then

    '        connectionStringsAttempts.Add("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\21novdb.mdb;Persist Security Info=False;")
    '        connectionStringsAttempts.Add("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\22maydb.mdb;Persist Security Info=False;")
    '    ElseIf selectedSemester = "3" Then
    '        ' Add databases from 3rd to 6th for semester 3
    '        For i As Integer = 3 To 6
    '            connectionStringsAttempts.Add("Provider=Microsoft.Jet.OLEDB.4.0;Data Source=C:\Path\To\Database" & i & ".mdb;Persist Security Info=False;")
    '        Next
    '    Else
    '        ' Handle other semesters if needed
    '        ' You can add connection strings for other semesters here
    '    End If

    '    ' Define the connection string for the grade master database
    '    Dim connectionStringGradeMaster As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Grade master.mdb;"
    '    Dim NoOfAtt As String = "NO_ATT" & selectedSemester

    '    ' Retrieve R values for master results
    '    Dim rValuesDictionaryMasterRes As Dictionary(Of Integer, String) = GetAllRvaluesSubData(selectedDepartment, selectedSemester, connectionStringMasterRes)

    '    ' Iterate through each attempt database
    '    For Each connectionStringAttempt As String In connectionStringsAttempts
    '        ' Retrieve R values for the current attempt database
    '        Dim rValuesDictionaryAttempt As Dictionary(Of Integer, String) = GetAllRvaluesSubData(selectedDepartment, selectedSemester, connectionStringAttempt)

    '        ' Open connection to grade master database
    '        Using connectionGradeMaster As New OleDbConnection(connectionStringGradeMaster)
    '            connectionGradeMaster.Open()

    '            ' Iterate through each REG_NO in the attempt results
    '            For Each regNo In rValuesDictionaryAttempt.Keys
    '                Dim rValueAttempt As String = rValuesDictionaryAttempt(regNo)

    '                ' Count occurrences of 'F' in the attempt database
    '                Dim fCount As Integer = If(rValueAttempt = "F", 1, 1)

    '                ' Check if 'F' exists in the master results for the same REG_NO
    '                If rValuesDictionaryAttempt.ContainsKey(regNo) AndAlso rValuesDictionaryMasterRes(regNo) = "F" Then
    '                    ' Increment fCount as 'F' exists in master results too
    '                    fCount += 1
    '                End If

    '                ' Update NO_ATT based on the count
    '                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & NoOfAtt & " = @FCount WHERE REG_NO = @RegNo"
    '                Dim updateCommand As New OleDbCommand(updateQuery, connectionGradeMaster)
    '                updateCommand.Parameters.AddWithValue("@FCount", fCount)
    '                updateCommand.Parameters.AddWithValue("@RegNo", regNo)
    '                updateCommand.ExecuteNonQuery()
    '            Next
    '        End Using
    '    Next
    'End Sub

    'Private Sub UpdateNoAttColumn(ByVal selectedSemester As String, ByVal selectedDepartment As String)
    '        ' Define connection strings for different databases
    '        Dim connectionStringMasterRes As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"

    '        ' Define connection strings for each attempt database
    '        Dim con1 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\21novdb.mdb;Persist Security Info=False;"
    '        Dim con2 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\22maydb.mdb;Persist Security Info=False;"
    '        ' Define connection strings for other semesters if needed
    '        Dim con3 As String = "..."
    '        Dim con4 As String = "..."
    '        Dim con5 As String = "..."
    '        Dim con6 As String = "..."

    '        ' Define the connection string for the grade master database
    '        Dim connectionStringGradeMaster As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Grade master.mdb;"
    '        Dim NoOfAtt As String = "NO_ATT" & selectedSemester

    '        ' Define dictionary to store REG_NO and corresponding F counts
    '        Dim regNoFCountDictionary As New Dictionary(Of String, Integer)

    '        ' Iterate through each attempt database connection string based on selected semester
    '        For i As Integer = selectedSemester To 6
    '            ' Define the connection string variable dynamically
    '            Dim connectionStringAttempt As String = If(i = 1, con1, If(i = 2, con2, If(i = 3, con3, If(i = 4, con4, If(i = 5, con5, con6)))))

    '            ' Retrieve R values for the current attempt database
    '            Dim rValuesDictionaryAttempt As Dictionary(Of String, Integer) = GetRvaluesFromAllSems(selectedDepartment, selectedSemester, connectionStringAttempt)

    '            ' Update fCount based on the values from the current attempt database
    '            For Each kvp As KeyValuePair(Of String, Integer) In rValuesDictionaryAttempt
    '                Dim regNo As String = kvp.Key
    '                Dim regNoCount As Integer = kvp.Value

    '                If Not regNoFCountDictionary.ContainsKey(regNo) Then
    '                    ' If REG_NO is not yet in the dictionary, add it with the current count
    '                    regNoFCountDictionary(regNo) = regNoCount
    '                Else
    '                    ' If REG_NO already exists in the dictionary, increment its count
    '                    regNoFCountDictionary(regNo) += regNoCount
    '                End If
    '            Next

    '        Next

    '        ' Open connection to grade master database
    '        Using connectionGradeMaster As New OleDbConnection(connectionStringGradeMaster)
    '            connectionGradeMaster.Open()

    '            ' Update NO_ATT based on the fCount for each REG_NO
    '            For Each pair As KeyValuePair(Of String, Integer) In regNoFCountDictionary
    '                Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & NoOfAtt & " = @FCount WHERE REG_NO = @RegNo"
    '                Dim updateCommand As New OleDbCommand(updateQuery, connectionGradeMaster)
    '                updateCommand.Parameters.AddWithValue("@FCount", pair.Value)
    '                updateCommand.Parameters.AddWithValue("@RegNo", pair.Key)
    '                updateCommand.ExecuteNonQuery()
    '            Next
    '        End Using
    '    End Sub


    Private Sub UpdateNoAttColumn(ByVal selectedSemester As Integer, ByVal selectedDepartment As String)
        ' Define connection strings for different databases
        Dim connectionStringMasterRes As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
        ' Define connection strings for each attempt database
        Dim con1 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\NOV21MASTER.mdb;Persist Security Info=False;"
        Dim con2 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\MAY22MASTER.mdb;Persist Security Info=False;"
        ' Define connection strings for other semesters if needed
        Dim con3 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\NOV22MASTER.mdb;Persist Security Info=False;"
        Dim con4 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\MAY23MASTER.mdb;Persist Security Info=False;"
        Dim con5 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\NOV23MASTER.mdb;Persist Security Info=False;"
        'Dim con6 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\DB\c21_GRDB\22maydb.mdb;Persist Security Info=False;"

        ' Define the connection string for the grade master database
        Dim connectionStringGradeMaster As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Grade master.mdb;"
        Dim NoOfAtt As String = "NO_ATT" & selectedSemester.ToString()

        ' Define dictionary to store REG_NO and corresponding F counts
        Dim regNoFCountDictionary As New Dictionary(Of String, Integer)

        ' Iterate through each attempt database connection string based on selected semester
        Dim rValue As String

        Dim subcodeColumnCount As Integer = GetAllcodesSub(selectedDepartment, selectedSemester)
        For i As Integer = selectedSemester To 5  '4
            ' Define the connection string variable dynamically
            Dim connectionStringAttempt As String = ""

            ' Define the connection string variable dynamically
            Select Case i
                Case 1
                    connectionStringAttempt = con1
                Case 2
                    connectionStringAttempt = con2
                Case 3
                    connectionStringAttempt = con3
                Case 4
                    connectionStringAttempt = con4
                Case 5
                    connectionStringAttempt = con5
                    'Case 6
                    'connectionStringAttempt = con6
            End Select

            ' Retrieve R values for the current attempt database
            Dim rValues As New Dictionary(Of String, List(Of String))()

            ' Query the database for R column values for the selected semester
            Using connection As New OleDbConnection(connectionStringAttempt)
                connection.Open()

                ' Construct the SELECT query with dynamic R columns
                Dim rColumns As New List(Of String)()
                For j As Integer = 1 To subcodeColumnCount
                    rColumns.Add("R" & selectedSemester & "_sub" & j)
                Next
                Dim rColumnsStr As String = String.Join(", ", rColumns)
                Dim query As String = "SELECT REG_NO, " & rColumnsStr & " FROM " & selectedDepartment

                ' Execute the query
                Using command As New OleDbCommand(query, connection)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        While reader.Read()
                            Dim regNo As String = reader.GetString(0)
                            If Not rValues.ContainsKey(regNo) Then
                                rValues(regNo) = New List(Of String)()
                            End If
                            For j As Integer = 1 To subcodeColumnCount
                                rValue = If(reader.IsDBNull(j), "0", reader.GetString(j))
                                rValues(regNo).Add(rValue)
                            Next
                        End While
                    End Using
                End Using
            End Using

            ' Check R values for 'F' and update counts
            ' Check R values for 'F' and update counts
            For Each kvp As KeyValuePair(Of String, List(Of String)) In rValues
                Dim rValuesList As List(Of String) = kvp.Value
                Dim regNo As String = kvp.Key
                If rValuesList.Contains("F") Then
                    ' Count occurrences of 'F' grades
                    If Not regNoFCountDictionary.ContainsKey(regNo) Then
                        regNoFCountDictionary(regNo) = 1
                    Else
                        regNoFCountDictionary(regNo) += 1
                    End If
                ElseIf rValuesList.Contains("P") And Not rValuesList.Contains("F") Then
                    ' Count occurrences of 'F' grades
                    If Not regNoFCountDictionary.ContainsKey(regNo) Then
                        regNoFCountDictionary(regNo) = 1
                    Else
                        regNoFCountDictionary(regNo) += 1
                    End If
                End If

            Next

        Next

        ' Open connection to grade master database
        Try
            Using connectionGradeMaster As New OleDbConnection(connectionStringGradeMaster)
                connectionGradeMaster.Open()

                ' Update NO_ATT based on the fCount for each REG_NO
                ' Update NO_ATT based on the fCount for each REG_NO
                For Each pair As KeyValuePair(Of String, Integer) In regNoFCountDictionary
                    Dim updateQuery As String = "UPDATE " & selectedDepartment & " SET " & NoOfAtt & " = @FCount WHERE REG_NO = @RegNo"
                    Dim updateCommand As New OleDbCommand(updateQuery, connectionGradeMaster)
                    updateCommand.Parameters.AddWithValue("@FCount", pair.Value)
                    updateCommand.Parameters.AddWithValue("@RegNo", pair.Key)
                    updateCommand.ExecuteNonQuery()
                Next

            End Using
        Catch ex As Exception
            ' Handle any exceptions here
        End Try
    End Sub



    Private Function GetDataForUpdate(ByVal selectedSemester As String, ByVal selectedDepartment As String, ByVal selectedSubject As String, ByVal connectionString As String) As List(Of Dictionary(Of String, String))
        Dim updateData As New List(Of Dictionary(Of String, String))

        Dim subCode As String = GetSubCodeForSubject(selectedDepartment, selectedSubject)
        Dim eSubField As String = "E" & selectedSemester & "_SUB" & subCode
        Dim iASubField As String = "IA" & selectedSemester & "_SUB" & subCode
        Dim Tsubfield As String = "T" & selectedSemester & "_SUB" & subCode
        Dim Rsubfield As String = "R" & selectedSemester & "_SUB" & subCode

        ' Your database query to fetch required data
        Dim queryString As String = "SELECT SLNO, REG_NO, " & iASubField & ", " & eSubField & ", " & Tsubfield & ", " & Rsubfield & " FROM " & selectedDepartment & " WHERE " & Rsubfield & " = 'P'"
        ' Replace YourTableName with the actual table name from your database

        ' Open connection to the database
        Using connection As New OleDbConnection(connectionString)
            connection.Open()

            ' Execute the query
            Using command As New OleDbCommand(queryString, connection)
                Using reader As OleDbDataReader = command.ExecuteReader()
                    ' Read data and add to the list
                    While reader.Read()
                        Dim rowData As New Dictionary(Of String, String)()
                        For i As Integer = 0 To reader.FieldCount - 1
                            ' Assuming all fields are strings
                            Dim columnName As String = reader.GetName(i)
                            Dim columnValue As String = reader.GetString(i)
                            rowData.Add(columnName, columnValue)
                        Next
                        updateData.Add(rowData)
                    End While
                End Using
            End Using
        End Using

        Return updateData
    End Function





    Private Function GetRvaluesFromAllSems(ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal connectionString As String) As Dictionary(Of String, Integer)
        Dim rValuesDictionary As New Dictionary(Of String, Integer)()

        Try
            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                ' Determine the number of 'R' columns for the selected semester
                Dim subcodeColumnCount As Integer = GetAllRcolumnCount(selectedDepartment, selectedSemester, connectionString)

                ' Build the SQL query dynamically to select all 'R' columns for the selected semester
                Dim query As String = "SELECT REG_NO, " & String.Join(", ", Enumerable.Range(1, subcodeColumnCount).Select(Function(subcode) "[R" & selectedSemester & "_SUB" & subcode & "]")) & " FROM [" & selectedDepartment & "]"

                ' Execute the query to retrieve REG_NO and all 'R' columns
                Using command As New OleDbCommand(query, connection)
                    Using reader As OleDbDataReader = command.ExecuteReader()
                        While reader.Read()
                            If Not reader.IsDBNull(reader.GetOrdinal("REG_NO")) Then
                                Dim regNo As String = reader("REG_NO").ToString()

                                ' Check if any 'R' column contains any value
                                Dim containsR As Boolean = False
                                For i As Integer = 1 To subcodeColumnCount
                                    Dim rSubField As String = "R" & selectedSemester & "_SUB" & i
                                    If Not reader.IsDBNull(reader.GetOrdinal(rSubField)) AndAlso Not String.IsNullOrEmpty(reader(rSubField).ToString()) Then
                                        containsR = True
                                        Exit For
                                    End If
                                Next

                                ' If any 'R' column has a value, update the count for the REG_NO
                                If containsR Then
                                    If rValuesDictionary.ContainsKey(regNo) Then
                                        rValuesDictionary(regNo) += 1 ' Increment count
                                    Else
                                        rValuesDictionary.Add(regNo, 1) ' Add REG_NO with count 1
                                    End If
                                End If
                            End If
                        End While
                    End Using
                End Using
            End Using
        Catch ex As Exception
            ' Log the exception details
            LogException(ex)
        End Try

        Return rValuesDictionary
    End Function



    Private Function GetAllRvaluesSubData(ByVal selectedDepartment As String, ByVal selectedSemester As String, ByVal connectionString As String) As Dictionary(Of String, List(Of String))
        Dim rValuesDictionary As New Dictionary(Of String, List(Of String))()
        Dim subcodeColumnCount As Integer = GetAllcodesSub(selectedDepartment, selectedSemester)

        Try
            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                For i As Integer = 1 To subcodeColumnCount
                    Dim rSubField As String = "R" & selectedSemester & "_SUB" & i
                    Dim query As String = "SELECT REG_NO, " & rSubField & " FROM [" & selectedDepartment & "]"

                    Using command As New OleDbCommand(query, connection)
                        Using reader As OleDbDataReader = command.ExecuteReader()
                            While reader.Read()
                                If Not reader.IsDBNull(reader.GetOrdinal("REG_NO")) Then
                                    Dim regNo As String = reader("REG_NO").ToString()
                                    Dim rSubValue As String = If(Not reader.IsDBNull(reader.GetOrdinal(rSubField)), reader(rSubField).ToString(), "")

                                    ' If REG_NO is not yet in the dictionary, add it with a new list
                                    If Not rValuesDictionary.ContainsKey(regNo) Then
                                        rValuesDictionary(regNo) = New List(Of String)()
                                    End If

                                    ' Add the R value to the list for the REG_NO
                                    rValuesDictionary(regNo).Add(rSubValue)
                                Else
                                    ' Log or handle invalid REG_NO values
                                End If
                            End While
                        End Using
                    End Using
                Next
            End Using
        Catch ex As Exception
            ' Log the exception details
            LogException(ex)
        End Try

        Return rValuesDictionary
    End Function






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
            Dim connectionString1 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"
            Using connection1 As New OleDbConnection(connectionString1)
                connection1.Open()

                ' Query to fetch data from R5_SUBT and R5_SUBP columns
                Dim queryFetchData As String = "SELECT SLNO, R5_SUBT, R5_SUBP FROM " & selectedDepartment

                Using fetchDataCommand As New OleDbCommand(queryFetchData, connection1)
                    Using reader As OleDbDataReader = fetchDataCommand.ExecuteReader()
                        ' Connection to the second database
                        Dim connectionString2 As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Grade master.mdb;Persist Security Info=False;"
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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\DICT C-21.mdb;"

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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"

            ' Determine the R_SUB field based on semester and subject code
            Dim rSubField As String = "R" & selectedSemester & "_SUB" & subCode
            If selectedSemester <> 5 Then


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
            End If
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
            Dim connectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb;"

            Using connection As New OleDbConnection(connectionString)
                connection.Open()

                For i As Integer = 1 To subcodeColumnCount
                    Dim rSubField As String = "R" & selectedSemester & "_SUB" & i
                    Dim query As String = "SELECT SLNO, " & rSubField & " FROM [" & selectedDepartment & "]"
                    If selectedSemester <> 5 Then

                        Using command As New OleDbCommand(query, connection)
                            Using reader As OleDbDataReader = command.ExecuteReader()
                                While reader.Read()
                                    Dim slno As String = reader.GetOrdinal("SLNO").ToString()
                                    Dim rSubValue As String = If(Not reader.IsDBNull(reader.GetOrdinal(rSubField)), reader(rSubField).ToString(), "")

                                    If Not r1SubDataDictionary.ContainsKey(slno) Then
                                        r1SubDataDictionary.Add(slno, New List(Of String)())
                                    End If

                                    r1SubDataDictionary(slno).Add(rSubValue)
                                End While
                            End Using
                        End Using

                    End If
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
            Dim querySelectData As String = "SELECT REG_NO, " & gpColumns & ", " & ceColumns & " FROM " & selectedDepartment

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
                        Dim queryUpdateTCP As String = "UPDATE " & selectedDepartment & " SET " & tcpSubField & " = ? WHERE REG_NO = ?"
                        Using updateTCPCommand As New OleDbCommand(queryUpdateTCP, connection)
                            updateTCPCommand.Parameters.AddWithValue("@TCP_VALUE", product)
                            updateTCPCommand.Parameters.AddWithValue("@REG_NO", reader("REG_NO"))
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
                    While reader.Read()
                        Dim sumOfGPCE As String = ""

                        ' Check if both gpColumns and ceColumns are not DBNull.Value
                        If Not reader(gpColumns) Is DBNull.Value AndAlso Not reader(ceColumns) Is DBNull.Value Then
                            Dim gpValue As Integer = Convert.ToInt32(reader(gpColumns))
                            Dim ceValue As Integer = Convert.ToInt32(reader(ceColumns))
                            sumOfGPCE = gpValue * ceValue
                        End If

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
            Dim cgpa1SubField As String = "CGPA" & selectedSemester
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
                            sgpa1Value = Decimal.Round(tcpeValue / tceValue, 2)
                        End If

                        '' If SINO value corresponds to "F" in r1Sub1DataList, set sgpa1Value to 0.00
                        If r1SubDataDictionary.ContainsKey(reader("SINO")) AndAlso r1SubDataDictionary(reader("SINO")).Contains("F") Then


                            ' Update cgpa1SubField to "Credit(s) Pending"
                            Dim queryUpdateCGPA1 As String = "UPDATE " & selectedDepartment & " SET " & cgpa1SubField & " = ? WHERE SINO = ?"
                            Using updateCGPA1Command As New OleDbCommand(queryUpdateCGPA1, connection)
                                updateCGPA1Command.Parameters.AddWithValue("@" & cgpa1SubField, "Credit(s) Pending")
                                updateCGPA1Command.Parameters.AddWithValue("@SINO", reader("SINO"))
                                updateCGPA1Command.ExecuteNonQuery()
                            End Using
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
            Dim r1SubDataDictionary As Dictionary(Of Integer, List(Of String)) = GetAllR1SubData(selectedDepartment, selectedSemester)
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

                            Dim cgpa_Value As Double = Convert.ToDouble(Math.Round(If(Not IsDBNull(tcpeSumValue), Convert.ToDouble(tcpeSumValue), 0.0) / Convert.ToDouble(tceSumValue), 2))

                            If r1SubDataDictionary.ContainsKey(reader("SINO")) AndAlso r1SubDataDictionary(reader("SINO")).Contains("F") Then
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
                            Dim cgpaValue As Double = Math.Round(If(Not IsDBNull(tcpeSumValue), Convert.ToDouble(tcpeSumValue), 0.0) / Convert.ToDouble(tceSumValue), 2)

                            If sgpaSubFieldValue <= 0 Or sgpaSubFieldValue >= 0 Then
                                ' If CGPA value is less than or equal to 0, set CGPA value to "Credit(s) Updated"
                                If r1SubDataDictionary.ContainsKey(reader("SINO")) AndAlso r1SubDataDictionary(reader("SINO")).Contains("F") Then
                                    Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = 'Credit(s) Pending' WHERE SINO = ?"

                                    Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                        updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                        updateCGPACommand.ExecuteNonQuery()
                                    End Using
                                Else
                                    Dim formattedCGPAValue As String = cgpaValue.ToString("F2")
                                    Dim queryUpdateCGPA As String = "UPDATE " & selectedDepartment & " SET " & cgpaSubField & " = ? WHERE SINO = ?"

                                    Using updateCGPACommand As New OleDbCommand(queryUpdateCGPA, connection)
                                        updateCGPACommand.Parameters.AddWithValue("@CGPAValue", formattedCGPAValue)
                                        updateCGPACommand.Parameters.AddWithValue("@SINO", sino)
                                        updateCGPACommand.ExecuteNonQuery()
                                    End Using
                                End If
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
            Dim otherConnectionString As String = "Provider=Microsoft.Jet.OLEDB.4.0;Data Source=E:\C21 GRADE DB\NEWDB\Master_res_db.mdb"

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
