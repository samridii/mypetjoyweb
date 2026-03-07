# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - main [ref=e2]:
    - img "Pet Illustration" [ref=e5]
    - generic [ref=e8]:
      - generic [ref=e9]:
        - heading "Welcome back!" [level=1] [ref=e10]
        - paragraph [ref=e11]: Enter your credentials to access your account
      - generic [ref=e12]:
        - generic [ref=e13]:
          - generic [ref=e14]:
            - generic [ref=e15]: Email address
            - textbox "you@example.com" [ref=e16]
          - generic [ref=e17]:
            - generic [ref=e18]:
              - generic [ref=e19]: Password
              - button "Forgot password?" [ref=e20]
            - generic [ref=e21]:
              - textbox "••••••••" [ref=e22]
              - button "Toggle password" [ref=e23]:
                - img [ref=e24]
          - button "Sign in" [ref=e27]
        - generic [ref=e32]: New to MyPetJoy?
        - link "Create an account" [ref=e33] [cursor=pointer]:
          - /url: /register
  - button "Open Next.js Dev Tools" [ref=e39] [cursor=pointer]:
    - img [ref=e40]
  - alert [ref=e43]
```