# Davraz

Try it NOW! https://canbax.github.io/davraz/

A graph visualization and exploration tool. Currently support visualizing Tiger Graph and Neo4j databases. You can watch [introductory video](https://www.youtube.com/watch?v=I8BgFve4sA8)

I was a virtual attendee at the Graph+AI World 2020! Graph+AI World Day 2 Keynote #GraphAIWorld https://www.tigergraph.com/graphaiworld/
You can directly watch [my presentation in the event from here](https://player.vimeo.com/video/463259298#t=49m08s)

## Screenshots

Connect to a TigerGraph instance.

https://user-images.githubusercontent.com/8426741/167489419-1a5ef6dc-1b16-4ce9-9cfb-e50b043a473c.mp4

Connect to a local Neo4j instance.

https://user-images.githubusercontent.com/8426741/173191229-3e1d5d43-0221-4ba1-a4ce-d0635d36fce4.mp4

"Load", "Save", ... from "File" menu


https://user-images.githubusercontent.com/8426741/168469340-ffc320a8-f354-47e2-ba15-6a532e4d1d66.mp4

"Delete Selected", "Hide Selected", ... from "Edit" menu


https://user-images.githubusercontent.com/8426741/168469711-9c9e8192-594b-4c7d-be96-56fcd930cac0.mp4

"Sample Data" and "Clear Data" from "Data" menu


https://user-images.githubusercontent.com/8426741/169713544-d80cb3a2-47b1-4353-b45d-a1d40a63be85.mp4

From _"Layout"_ menu, you can run an incremental or randomized layout. There are many different layout types but the default is [fCoSE](https://github.com/iVis-at-Bilkent/cytoscape.js-fcose) algorithm.


https://user-images.githubusercontent.com/8426741/169894364-1b580bc4-8e29-4fb3-b617-78584c6fa86e.mp4

From _"Highlight"_ menu, elements can be emphasized to distinguish from others.


https://user-images.githubusercontent.com/8426741/169894862-12f0ad6d-3ff1-4576-b33f-13db20a370c7.mp4

From _"Compound"_ menu, compound elements can be created or removed.


https://user-images.githubusercontent.com/8426741/169895099-7ea9f1b6-7b8a-4610-89c6-22889c6807e7.mp4

From _"Table"_ menu, whole data or a part of the existing data can be shown as table(s).


https://user-images.githubusercontent.com/8426741/169895482-1400933c-40f9-4eef-851b-992f15e9320a.mp4


From _"Cluster"_ menu, you can run "Markov Clustering" algorithm or cluster degree-1 nodes.


https://user-images.githubusercontent.com/8426741/169896671-bd270f71-a985-4497-9c09-413cca9245a0.mp4


<p align="center">
    <img src="doc/img/compound_nodes.png" width="600"/>
</p>
<p align="center">
  Support for compound nodes
</p>

<p align="center">
    <img src="doc/img/File Explorer like windows.gif" width="600"/>
</p>
<p align="center">
  Windows very similar to file explorer of an operating system
</p>

<p align="center">
    <img src="doc/img/animated_edges_on_table_hover.gif" width="600"/>
</p>
<p align="center">
  Animated edges when hovered on table
</p>

<p align="center">
    <img src="doc/img/show_results_of_installed_query_as_json.png" width="600"/>
</p>
<p align="center">
  Show results of a query as JSON at the same time
</p>

## YAAAY!

This project got a 1st Place Reward in [TigerGraph 2020 Graphathon](https://devpost.com/software/graphex)

## todo (or might todo)

- adding/updating graph elements
- client-side filterig with raw cytoscape.js
- badges on the nodes
- show statistics
- graph theoretical properties

## For Developers
Built with [Angular CLI](https://github.com/angular/angular-cli) version 10.0.4.
Use `npm i` to install dependencies. `ng s` to run in development mode. 
I also use `angular-cli-ghpages` for deploying my app to github-pages branch using the command `ng deploy --base-href=/davraz/`. Thanks for this useful library.
