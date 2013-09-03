google-spreadsheet-based-sankey-diagram
=======================================

My patch of an existing google spreadsheet based sankey (alluvial) diagram rendering webpage.

Example of calling this page:

http://vicmortelmans.github.io/google-spreadsheet-based-sankey-diagram/index.html?key=0Au659FdpCliwdHJNU01nZWwxcG1mZjJGMDlFbDJaR0E&gid=3&tq=select%20A,B,C&title=Financieel%20model%20Kerkbestuur%20en%20Parochiale%20Werken&output=1

There are three types of data that can be used as source:


URL with output=0 or unspecified expects

- field1
- field2
-field3
- …

The fields can contain combined values, by default split on comma, but another separator can be specified in the URL using splitby.
This data is converted to flows by counting combinations of fields two by two. E.g. if 5 rows have a value 'A' in field1 and a value 'B' in field2, there will be a flow of value 5 from source 'A' to target 'B'. First combinations in field1 (source) and field2 (target) are listed, then combinations in field2 (source) and field3 (target) and so on.


URL with output=1 expects

- source
- target
- value

Each row represents a flow from source to target


URL with output=2 expects

- source
- target
- value
- description

The description will be added as a new node in the flow between source and target and serves merely as a caption to identify the flow.

