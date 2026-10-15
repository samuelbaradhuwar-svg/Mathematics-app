import re,sys
css=open('/tmp/build/dist/app.css').read()
js=open('/tmp/build/dist/app.js').read()
js=js.replace('</script','<\\/script')
html=f'''<title>Judah's Maths Tutor</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Nunito:ital,wght@0,400;0,600;0,700;0,800;1,400&family=STIX+Two+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap">
<style>
{css}
#boot{{display:grid;place-items:center;gap:12px;min-height:60dvh;text-align:center;font-family:var(--font-family-heading);font-size:1.2rem;color:var(--foreground)}}
</style>
<div id="root"><div id="boot"><span style="font-size:3rem;font-family:var(--font-family-math)">π</span>Getting your lessons ready…</div></div>
<script>
{js}
</script>
'''
open('/tmp/build/dist/page.html','w').write(html)
print(len(html))
