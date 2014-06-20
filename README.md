SwiftFS
=======

A Swift-savvy drop-in replacement for Node filesystem.

Run the demo with:
node snode.js

It will start a file browser on http://localhost:8080. All of the content will be served from Swift. 

The idea is to use the swift object as a drop-in replacement for Node's fs filesystem object. If you can't or don't want to use FUSE, this would allow Node to serve local or openstack files.

This demo could be used as part of a URL re-writing system to map non-existent URLs to Swift storage.


A work in progress...
