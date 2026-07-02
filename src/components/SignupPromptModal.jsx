import React from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import AuthModal from '@/components/AuthModal';

const SignupPromptModal = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800 text-white">
        <DialogHeader>
          <div className="mx-auto bg-slate-800 p-3 rounded-full mb-4 w-fit border border-slate-700">
            <Lock className="h-8 w-8 text-orange-500" />
          </div>
          <DialogTitle className="text-center text-2xl font-bold">Free Limit Reached</DialogTitle>
          <DialogDescription className="text-center text-slate-300 pt-2 text-base">
            You have used your 3 free tour assistant prompts. Create a free account or log in to continue planning your tour!
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col gap-3 mt-4">
          <AuthModal 
            defaultTab="signup"
            trigger={
              <Button className="w-full bg-orange-600 hover:bg-orange-700 text-lg py-6 font-semibold">
                Create Free Account
              </Button>
            }
          />
          
          <AuthModal 
            defaultTab="login"
            trigger={
              <Button variant="outline" className="w-full border-slate-700 hover:bg-slate-800 hover:text-white py-6">
                Log In
              </Button>
            }
          />

          <Button variant="ghost" onClick={onClose} className="mt-2 text-slate-500 hover:text-slate-400">
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SignupPromptModal;